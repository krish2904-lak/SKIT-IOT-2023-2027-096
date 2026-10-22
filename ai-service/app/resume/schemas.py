"""
Pydantic schema definitions for resume skill extraction and parsing.
"""

from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field


class ExtractedSkill(BaseModel):
    name: str = Field(..., description="Canonical or raw skill name, e.g. 'python', 'react'")
    level: str = Field("intermediate", description="Proficiency level: beginner, intermediate, advanced")
    source: str = Field("RESUME_PARSED", description="Source indicator for skill provenance")


class ResumeExtractionResult(BaseModel):
    skills: List[ExtractedSkill] = Field(default_factory=list, description="Extracted technical skills")
    projects: List[str] = Field(default_factory=list, description="Extracted project descriptions or titles")
    projects_count: int = Field(0, description="Total detected technical projects")
    certifications_count: int = Field(0, description="Total detected technical certifications")
    experience_level: str = Field("intermediate", description="Estimated experience level: beginner, intermediate, advanced")
    domains: List[str] = Field(default_factory=list, description="Matched career/technology domain interests")
    extraction_method: str = Field("deterministic_fallback", description="Method utilized: llm or deterministic_fallback")


class ResumeParseResponse(BaseModel):
    filename: str = Field(..., description="Name of uploaded resume file")
    extraction_method: str = Field(..., description="Extraction engine utilized (llm or deterministic_fallback)")
    extracted_skills: List[ExtractedSkill] = Field(..., description="Extracted technical skills with proficiency")
    extracted_domains: List[str] = Field(..., description="Extracted domain interests")
    projects_count: int = Field(..., description="Number of detected projects")
    certifications_count: int = Field(..., description="Number of detected certifications")
    experience_level: str = Field(..., description="Estimated experience level")
    mapped_features: Dict[str, float] = Field(..., description="48-feature mapping dictionary")
    merged_profile: Dict[str, Any] = Field(..., description="Complete profile merged with manual inputs (manual inputs win on conflict)")
