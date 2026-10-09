"""
FastAPI Application for F-096 AI Recommendation Service.
Provides RESTful endpoints for health checks, model status, technology stack metadata,
and student tech-stack recommendation inference.
"""

from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    StudentProfileRequest,
    RecommendationResponse,
)
from model.recommendation.predictor import TechStackPredictor
from model.recommendation.tech_stacks import TECH_STACK_CATALOG

app = FastAPI(
    title="F-096 AI Service",
    description="AI service for technology stack recommendation with ERP integration",
    version="1.0.0",
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
def recommend_tech_stack(profile: StudentProfileRequest) -> Dict[str, Any]:
    """
    Receives student profile input (academic scores, skills, interests) and returns
    top-K ranked tech-stack recommendations matching project data contracts.
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
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Inference error: {str(e)}",
        )
