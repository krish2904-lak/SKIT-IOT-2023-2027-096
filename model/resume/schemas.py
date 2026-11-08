"""
Pydantic schemas and data contracts for resume extraction, parsing, and feature mapping.
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class ExtractedSkill(BaseModel):
    """Individual skill extracted from resume text or manual profile input."""
    name: str = Field(..., description="Canonical skill identifier (e.g., 'python', 'docker', 'react')")
    level: str = Field("intermediate", description="Proficiency level: beginner, intermediate, advanced")
    source: Optional[str] = Field("RESUME_EXTRACTED", description="Source indicator: RESUME_RULE, RESUME_LLM, MANUAL")
    confidence: float = Field(0.85, ge=0.0, le=1.0, description="Extraction confidence score")


class ResumeExtractionResult(BaseModel):
    """Structured extraction outcome from document text analysis."""
    skills: List[ExtractedSkill] = Field(default_factory=list, description="Extracted technical skills")
    domains: List[str] = Field(default_factory=list, description="Extracted or inferred career domains")
    projects: List[str] = Field(default_factory=list, description="Extracted project descriptions or titles")
    projects_count: int = Field(0, ge=0, description="Count of detected technical projects")
    certifications: List[str] = Field(default_factory=list, description="Extracted certifications or awards")
    certifications_count: int = Field(0, ge=0, description="Count of detected certifications")
    cgpa_hint: Optional[float] = Field(None, ge=0.0, le=10.0, description="Extracted academic CGPA hint if detected")
    experience_level: str = Field("intermediate", description="Overall experience classification")
    extraction_method: str = Field("rule_based", description="Extraction mechanism: rule_based, llm_gemini, or llm_fallback")
    raw_text_length: int = Field(0, ge=0, description="Length of processed document text in characters")


class ResumeExtractResponse(BaseModel):
    """API response model for POST /api/v1/resume/extract."""
    extraction_method: str = Field(..., description="Method utilized: rule_based, llm_gemini, or llm_fallback")
    extracted_skills: List[ExtractedSkill] = Field(..., description="List of extracted technical skills")
    extracted_domains: List[str] = Field(..., description="List of recognized career domains")
    projects_count: int = Field(..., description="Count of detected projects")
    certifications_count: int = Field(..., description="Count of detected certifications")
    cgpa_hint: Optional[float] = Field(None, description="Extracted CGPA if present in resume")
    experience_level: str = Field(..., description="Classified student experience tier")
    mapped_features: Dict[str, float] = Field(..., description="Full 48-dimensional normalized feature dictionary")
    confidences: Dict[str, float] = Field(..., description="Confidence scores per feature field [0.0 - 1.0]")
    merged_profile: Dict[str, Any] = Field(..., description="Student profile dictionary ready for model inference")

    model_config = {
        "json_schema_extra": {
            "example": {
                "extraction_method": "rule_based",
                "extracted_skills": [
                    {"name": "python", "level": "advanced", "source": "RESUME_RULE", "confidence": 0.9},
                    {"name": "docker", "level": "intermediate", "source": "RESUME_RULE", "confidence": 0.85}
                ],
                "extracted_domains": ["cloud_devops", "ai_ml"],
                "projects_count": 2,
                "certifications_count": 1,
                "cgpa_hint": 8.5,
                "experience_level": "intermediate",
                "mapped_features": {
                    "cgpa": 0.85,
                    "course_web_technologies": 0.70,
                    "skill_python": 1.0,
                    "skill_docker": 0.67
                },
                "confidences": {
                    "cgpa": 0.80,
                    "course_web_technologies": 0.0,
                    "skill_python": 0.90,
                    "skill_docker": 0.85
                },
                "merged_profile": {
                    "cgpa": 8.5,
                    "skills": [{"name": "python", "level": "advanced"}],
                    "interests": ["cloud_devops", "ai_ml"]
                }
            }
        }
    }


class ResumeTextExtractRequest(BaseModel):
    """Optional JSON payload for pasted resume text extraction."""
    text: str = Field(..., min_length=10, description="Pasted resume raw text")
    manual_profile: Optional[Dict[str, Any]] = Field(None, description="Optional manual student profile to merge (manual wins)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "text": "Nishant Kumawat\nSkills: Python, Scikit-learn, PyTorch, Docker, Git\nProjects: AI Tech Stack Recommender with SHAP\nCertifications: Deep Learning Specialization",
                "manual_profile": {
                    "cgpa": 8.8,
                    "skills": [{"name": "python", "level": "advanced"}]
                }
            }
        }
    }
