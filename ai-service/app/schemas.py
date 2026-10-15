"""
Pydantic schema definitions for the AI Recommendation Service API.
Defines request payloads and response contracts aligned with the project specification.
"""

from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field


class StudentSkillInput(BaseModel):
    name: str = Field(..., description="Skill name, e.g. 'python', 'react'")
    level: str = Field("intermediate", description="Proficiency level: beginner, intermediate, advanced")
    source: Optional[str] = Field("SELF_REPORTED", description="Source: ERP_COURSEWORK, SELF_REPORTED, RESUME_PARSED")


class AcademicScoresInput(BaseModel):
    web_technologies: Optional[float] = Field(70.0, ge=0.0, le=100.0)
    dbms: Optional[float] = Field(70.0, ge=0.0, le=100.0)
    dsa: Optional[float] = Field(70.0, ge=0.0, le=100.0)
    iot_embedded: Optional[float] = Field(70.0, ge=0.0, le=100.0)
    ml_math: Optional[float] = Field(70.0, ge=0.0, le=100.0)
    cloud_computing: Optional[float] = Field(70.0, ge=0.0, le=100.0)
    operating_systems: Optional[float] = Field(70.0, ge=0.0, le=100.0)


class StudentProfileRequest(BaseModel):
    student_id: Optional[str] = Field("SKIT/STUDENT/001", description="Student ERP roll or ID")
    branch: Optional[str] = Field("CSE (IoT)", description="Academic branch")
    semester: Optional[int] = Field(6, ge=1, le=8)
    cgpa: Optional[float] = Field(7.5, ge=0.0, le=10.0)
    academic_scores: Optional[AcademicScoresInput] = Field(default_factory=AcademicScoresInput)
    skills: Optional[List[Union[StudentSkillInput, str]]] = Field(
        default_factory=list,
        description="Declared or parsed technical skills",
    )
    interests: Optional[List[str]] = Field(
        default_factory=list,
        description="List of domain interests",
    )
    projects_completed: Optional[int] = Field(1, ge=0, le=20)
    certifications_count: Optional[int] = Field(0, ge=0, le=10)
    top_k: Optional[int] = Field(3, ge=1, le=7, description="Number of top recommendations to return")


class TechItem(BaseModel):
    name: str
    category: str
    description: Optional[str] = None


class RoadmapStepSchema(BaseModel):
    phase: str
    duration: str
    title: str
    topics: List[str]
    recommendedResource: str


class FeatureContributionItem(BaseModel):
    feature: str = Field(..., description="Engineered feature token name", examples=["skill_python"])
    label: str = Field(..., description="Human-readable feature name", examples=["Python Programming Skill"])
    value: float = Field(..., description="Student feature value [0.0 - 1.0]", examples=[1.0])
    shap_value: float = Field(..., description="SHAP attribution impact value", examples=[0.1829])
    direction: str = Field(..., description="Impact direction ('supports' or 'reduces')", examples=["supports"])


class ItemExplanationSchema(BaseModel):
    summary: str = Field(
        ...,
        description="Plain-language explanation summary built from top SHAP features",
        examples=[
            "Recommended mainly because of strong Python Programming Skill and Machine Learning & Mathematics Coursework."
        ],
    )
    top_features: List[FeatureContributionItem] = Field(
        ...,
        description="Top contributing features sorted by absolute SHAP value impact",
    )


class RecommendationItemResponse(BaseModel):
    id: str
    stack_code: str
    title: str
    category: str
    matchScore: float
    difficulty: str
    estimatedTimeToLearn: str
    targetRoles: List[str]
    technologies: List[TechItem]
    whyRecommendedSnippet: str
    rank: int
    roadmap: Optional[List[RoadmapStepSchema]] = None
    explanation: Optional[ItemExplanationSchema] = Field(
        None,
        description="SHAP explainability insights (populated when explain=true)",
    )


class RecommendationResponse(BaseModel):
    student_id: str
    model_version: str
    timestamp: str
    primary_recommendation: Optional[RecommendationItemResponse]
    alternative_recommendations: List[RecommendationItemResponse]
    all_ranked_stacks: List[RecommendationItemResponse]
    recommendations: Optional[List[RecommendationItemResponse]] = Field(
        None,
        description="Alias for all_ranked_stacks containing full recommendations with optional explanations",
    )
    active_student_features: List[Dict[str, Any]]


class FeatureImpactSchema(BaseModel):
    featureName: str
    displayName: str
    shapValue: float
    impactDirection: str
    category: str
    explanationNote: str
    remedyElective: Optional[str] = None
    potentialBoost: Optional[float] = None


class StackExplanationResponse(BaseModel):
    recommendationId: str
    recommendationTitle: str
    baseConfidence: float
    summaryText: str
    topPositiveFactors: List[FeatureImpactSchema]
    topNegativeFactors: List[FeatureImpactSchema]
    learningPrerequisites: List[str]


class ExplanationRequest(BaseModel):
    profile: StudentProfileRequest
    stack_code: Optional[str] = Field(None, description="Optional stack code to explain; defaults to top recommended")

