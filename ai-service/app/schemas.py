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


class RecommendationResponse(BaseModel):
    student_id: str
    model_version: str
    timestamp: str
    primary_recommendation: Optional[RecommendationItemResponse]
    alternative_recommendations: List[RecommendationItemResponse]
    all_ranked_stacks: List[RecommendationItemResponse]
    active_student_features: List[Dict[str, Any]]
