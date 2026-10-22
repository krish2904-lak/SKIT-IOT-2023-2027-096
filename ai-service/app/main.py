"""
FastAPI Application for F-096 AI Recommendation Service.
Provides RESTful endpoints for health checks, model status, technology stack metadata,
Random Forest recommendations, TreeSHAP explainability, and resume parsing with skill extraction.
"""

import json
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Ensure repository root is on sys.path so 'model' package is always resolvable
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from .schemas import (
    StudentProfileRequest,
    RecommendationResponse,
    StackExplanationResponse,
    ExplanationRequest,
    ResumeParseResponse,
)
from model.recommendation.predictor import TechStackPredictor
from model.recommendation.tech_stacks import TECH_STACK_CATALOG
from model.explainability import ShapExplainer, RecommendationExplainer
from app.resume import (
    extract_text_from_file,
    LLMResumeExtractor,
    merge_resume_with_manual,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Warms up and caches the model predictor and TreeSHAP explainer once at startup."""
    try:
        TechStackPredictor.get_instance()
        ShapExplainer.get_instance()
    except Exception as e:
        print(f"[STARTUP NOTE] Warm-up initialization: {e}")
    yield


app = FastAPI(
    title="F-096 AI Service",
    description=(
        "Personalized AI Technology Stack Recommendation Microservice with "
        "TreeSHAP Explainability, Resume Parsing, and College ERP Integration."
    ),
    version="1.1.0",
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


@app.get("/health", tags=["System"])
def health_check():
    """Preserved baseline health check endpoint."""
    return {"status": "ok", "service": "ai-service"}


@app.get("/api/v1/model-info", tags=["Model"])
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


@app.get("/api/v1/tech-stacks", tags=["Catalog"])
def get_available_tech_stacks() -> Dict[str, Any]:
    """Returns the catalog of all 7 supported technology stack categories and details."""
    return {
        "count": len(TECH_STACK_CATALOG),
        "stacks": list(TECH_STACK_CATALOG.values()),
    }


@app.post(
    "/api/v1/recommend",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
    tags=["Recommendation"],
)
def recommend_tech_stack(
    profile: StudentProfileRequest,
    explain: bool = Query(False, description="When true, attaches TreeSHAP feature contributions and summary"),
) -> Dict[str, Any]:
    """
    Receives student profile input (academic scores, skills, interests, optional resume features)
    and returns top-K ranked tech-stack recommendations matching project data contracts.
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

    # If resume_features were provided directly, blend them into student_data
    if profile.resume_features:
        student_data["resume_features"] = profile.resume_features

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
            explainer = ShapExplainer.get_instance()
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
    tags=["Recommendation"],
)
def recommend_with_explanation(profile: StudentProfileRequest) -> Dict[str, Any]:
    """
    Convenience alias endpoint returning top-K recommendations with SHAP explanations.
    Equivalent to POST /api/v1/recommend?explain=true.
    """
    return recommend_tech_stack(profile=profile, explain=True)


@app.post(
    "/api/v1/explain",
    response_model=StackExplanationResponse,
    status_code=status.HTTP_200_OK,
    tags=["Explainability"],
)
def explain_tech_stack_recommendation(request: ExplanationRequest) -> Dict[str, Any]:
    """
    Computes exact TreeSHAP explainability insights for a student profile:
    baseConfidence, 1-2 sentence plain-English summaryText, top 5 positive factors,
    top 5 negative factors (with feature, label, value, shapValue), and learning prerequisites.
    Conforms directly to the frontend StackExplanation contract.
    """
    try:
        explainer = ShapExplainer.get_instance()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"TreeSHAP explainability engine unavailable: {str(e)}",
        )

    # Extract student data dictionary from request (handles nested profile or direct fields)
    if request.profile is not None:
        student_data = request.profile.model_dump()
    else:
        req_dict = request.model_dump()
        req_dict.pop("profile", None)
        req_dict.pop("stack_code", None)
        student_data = req_dict

    try:
        explanation = explainer.explain_recommendation(
            student_data,
            stack_code=request.stack_code,
            top_n=5,
        )
        return explanation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Explanation generation error: {str(e)}",
        )


@app.get(
    "/api/v1/explain/global-importance",
    tags=["Explainability"],
)
def get_global_shap_importance(top_n: int = Query(15, ge=1, le=48)) -> Dict[str, Any]:
    """
    Computes global feature importance across dataset samples via mean absolute SHAP value.
    Used for research paper publication analysis and model transparency reporting.
    """
    try:
        explainer = ShapExplainer.get_instance()
        importance = explainer.get_global_feature_importance(top_n=top_n)
        return {
            "top_n": top_n,
            "global_feature_importance": importance,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Global SHAP calculation error: {str(e)}",
        )


@app.post(
    "/api/v1/resume/parse",
    response_model=ResumeParseResponse,
    status_code=status.HTTP_200_OK,
    tags=["Resume Parsing"],
)
async def parse_student_resume(
    file: UploadFile = File(..., description="Uploaded resume file (PDF or DOCX)"),
    manual_profile: Optional[str] = Form(
        None,
        description="Optional JSON string of manual student profile inputs to merge (manual inputs win on conflict)",
    ),
) -> Dict[str, Any]:
    """
    Extracts technical skills, projects, and domain interests from an uploaded resume (PDF or DOCX).
    Enforces a 5MB size limit, detects empty or scanned files, runs LLM/deterministic taxonomy
    extraction, and maps competencies into the 48-feature schema merged with manual form inputs.
    
    PII Safety:
    Resume text is handled strictly in memory and is never logged or persisted.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must have a valid filename.",
        )

    # Read file buffer into memory
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file buffer: {str(e)}",
        )

    # Validate size & format and extract text
    try:
        text = extract_text_from_file(contents, file.filename)
    except ValueError as val_err:
        err_msg = str(val_err)
        if "exceeds maximum allowed limit" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=err_msg,
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg,
        )

    # Parse manual profile JSON if provided
    manual_data: Optional[Dict[str, Any]] = None
    if manual_profile:
        try:
            manual_data = json.loads(manual_profile)
        except json.JSONDecodeError as json_err:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid manual_profile JSON string: {str(json_err)}",
            )

    # Perform extraction via LLM or deterministic fallback
    extractor = LLMResumeExtractor()
    extracted_result = extractor.extract(text)

    # Merge with manual inputs (manual inputs win on conflicts) and map to 48 features
    merged_profile, mapped_features, _ = merge_resume_with_manual(
        extracted=extracted_result,
        manual_profile=manual_data,
    )

    return {
        "filename": file.filename,
        "extraction_method": extracted_result.extraction_method,
        "extracted_skills": extracted_result.skills,
        "extracted_domains": extracted_result.domains,
        "projects_count": extracted_result.projects_count,
        "certifications_count": extracted_result.certifications_count,
        "experience_level": extracted_result.experience_level,
        "mapped_features": mapped_features,
        "merged_profile": merged_profile,
    }
