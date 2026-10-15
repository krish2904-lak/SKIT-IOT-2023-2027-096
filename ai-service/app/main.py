"""
FastAPI Application for F-096 AI Recommendation Service.
Provides RESTful endpoints for health checks, model status, technology stack metadata,
and student tech-stack recommendation inference.
"""

import sys
from pathlib import Path
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

# Ensure repository root is on sys.path so 'model' package is always resolvable
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from .schemas import (
    StudentProfileRequest,
    RecommendationResponse,
    StackExplanationResponse,
    ExplanationRequest,
)
from model.recommendation.predictor import TechStackPredictor
from model.recommendation.explainability import TechStackExplainer
from model.recommendation.tech_stacks import TECH_STACK_CATALOG
from model.explainability import RecommendationExplainer

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Warms up and caches the model predictor and TreeSHAP explainer once at startup."""
    try:
        TechStackPredictor.get_instance()
        RecommendationExplainer.get_instance()
    except Exception as e:
        print(f"[STARTUP NOTE] Warm-up initialization: {e}")
    yield


app = FastAPI(
    title="F-096 AI Service",
    description="AI service for technology stack recommendation with ERP integration",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend and Node.js gateway access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """Preserved baseline health check endpoint."""
    return {"status": "ok", "service": "ai-service"}


@app.get("/api/v1/model-info")
def get_model_info():
    """Returns metadata, accuracy, and active configuration of the trained model."""
    try:
        predictor = TechStackPredictor.get_instance()
        return {
            "status": "ready",
            "model_version": predictor.metadata.get("model_version", "1.0.0-rf"),
            "model_type": predictor.metadata.get("model_type", "RandomForestClassifier"),
            "created_at": predictor.metadata.get("created_at"),
            "metrics": predictor.metadata.get("metrics", {}),
            "num_features": len(predictor.feature_names),
            "target_classes": predictor.classes,
            "top_influential_features": predictor.metadata.get("top_features", [])[:5],
        }
    except Exception as e:
        return {
            "status": "not_loaded",
            "error": str(e),
            "instruction": "Run `python -m model.training.train` to train and serialize the model.",
        }


@app.get("/api/v1/tech-stacks")
def get_available_tech_stacks() -> Dict[str, Any]:
    """Returns the catalog of all supported technology stack categories and details."""
    return {
        "count": len(TECH_STACK_CATALOG),
        "stacks": list(TECH_STACK_CATALOG.values()),
    }


@app.post(
    "/api/v1/recommend",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
)
def recommend_tech_stack(
    profile: StudentProfileRequest,
    explain: bool = Query(False, description="When true, attaches SHAP feature contributions and summary"),
) -> Dict[str, Any]:
    """
    Receives student profile input (academic scores, skills, interests) and returns
    top-K ranked tech-stack recommendations matching project data contracts.
    When explain=true, attaches SHAP TreeExplainer feature attributions and summary.
    """
    try:
        predictor = TechStackPredictor.get_instance()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Recommendation model unavailable: {str(e)}",
        )

    # Convert Pydantic model to dict for preprocessor
    student_data = profile.model_dump()
    top_k = profile.top_k or 3

    try:
        result = predictor.predict_for_student(student_data, top_k=top_k)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Inference error: {str(e)}",
        )

    # When explain is requested, compute TreeSHAP feature contributions
    if explain:
        try:
            explainer = RecommendationExplainer.get_instance()
            shap_exps = explainer.explain_student(student_data, top_k=top_k)
            shap_map = {item["stack_code"]: item["explanation"] for item in shap_exps}

            if result.get("primary_recommendation"):
                st_code = result["primary_recommendation"]["stack_code"]
                if st_code in shap_map:
                    result["primary_recommendation"]["explanation"] = shap_map[st_code]

            for item in result.get("alternative_recommendations", []):
                st_code = item["stack_code"]
                if st_code in shap_map:
                    item["explanation"] = shap_map[st_code]

            for item in result.get("all_ranked_stacks", []):
                st_code = item["stack_code"]
                if st_code in shap_map:
                    item["explanation"] = shap_map[st_code]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"SHAP explanation generation error: {str(e)}",
            )

    result["recommendations"] = result.get("all_ranked_stacks", [])
    return result


@app.post(
    "/api/v1/recommend/explain",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
)
def recommend_with_explanation(profile: StudentProfileRequest) -> Dict[str, Any]:
    """
    Convenience alias endpoint that returns top-K recommendations with SHAP explanations.
    Equivalent to POST /api/v1/recommend?explain=true.
    """
    return recommend_tech_stack(profile=profile, explain=True)


@app.post(
    "/api/v1/explain",
    response_model=StackExplanationResponse,
    status_code=status.HTTP_200_OK,
)
def explain_tech_stack_recommendation(request: ExplanationRequest) -> Dict[str, Any]:
    """
    Computes explainability insights (SHAP factor impacts, positive drivers,
    bridgeable gaps, remedies, and prerequisites) for a student profile.
    """
    try:
        explainer = TechStackExplainer.get_instance()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Explainability engine unavailable: {str(e)}",
        )

    student_data = request.profile.model_dump()
    try:
        explanation = explainer.explain_recommendation(
            student_data,
            stack_code=request.stack_code,
        )
        return explanation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Explanation generation error: {str(e)}",
        )
