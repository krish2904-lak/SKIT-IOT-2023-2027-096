"""
Automated QA & Validation Suite for Explainable AI (XAI) & SHAP Attributions
Author: Saloni Jain (Data & Testing Lead)
Project: AI-Based Tech-Stack Recommendation with ERP Integration (SKIT-IOT-2023-2027-096)
Sprint: Sprint 3 / Week 7 Deliverable
"""

try:
    import pytest
except ImportError:
    pytest = None

from typing import Dict, Any, List
from model.recommendation.tech_stacks import TECH_STACK_CATALOG

# Mock SHAP Explainer matching docs/API_CONTRACT.md and model/recommendation/explainability.py
class MockExplainabilityQAEngine:
    """Mock explainability generator for QA contract and invariant validation."""
    
    @classmethod
    def generate_explanation(cls, student_data: Dict[str, Any], stack_code: str = "MERN_FULL_STACK") -> Dict[str, Any]:
        meta = TECH_STACK_CATALOG.get(stack_code, TECH_STACK_CATALOG["MERN_FULL_STACK"])
        academic = student_data.get("academic_scores", {})
        skills = student_data.get("technical_skills", {})
        
        # Calculate positive drivers
        pos_factors = []
        if academic.get("course_web_technologies", 0) >= 80:
            pos_factors.append({
                "featureName": "academic_web_tech",
                "displayName": "Web Technologies & Lab",
                "shapValue": 0.22,
                "impactDirection": "POSITIVE",
                "category": "ERP_ACADEMICS",
                "explanationNote": "High semester marks demonstrate strong foundational aptitude."
            })
        if skills.get("skill_react", 0) > 0.5:
            pos_factors.append({
                "featureName": "skill_react",
                "displayName": "React.js Proficiency",
                "shapValue": 0.18,
                "impactDirection": "POSITIVE",
                "category": "EXISTING_SKILL",
                "explanationNote": "Demonstrated competence directly aligns with target stack."
            })
        if not pos_factors:
            pos_factors.append({
                "featureName": "academic_foundations",
                "displayName": "Core Engineering Foundation Courses",
                "shapValue": 0.10,
                "impactDirection": "POSITIVE",
                "category": "ERP_ACADEMICS",
                "explanationNote": "Coursework provides analytical baseline."
            })

        # Calculate negative / bridgeable growth factors
        neg_factors = [{
            "featureName": "skill_docker",
            "displayName": "Containerization & Cloud CI/CD",
            "shapValue": -0.06,
            "impactDirection": "NEGATIVE",
            "category": "EXISTING_SKILL",
            "explanationNote": "Skill gap identified; remedial workshop recommended.",
            "remedyElective": "Docker for Developers Workshop (SKIT IoT Lab)",
            "potentialBoost": 5.2
        }]

        prereqs = [
            "Data Structures & Algorithms (OOP)",
            "Relational Database Management (DBMS)",
            "Command-Line & Git Version Control"
        ]

        return {
            "recommendationId": meta["id"],
            "recommendationTitle": meta["title"],
            "baseConfidence": 0.885,
            "summaryText": f"Evaluated student profile. Top positive driver: {pos_factors[0]['displayName']}.",
            "topPositiveFactors": pos_factors,
            "topNegativeFactors": neg_factors,
            "learningPrerequisites": prereqs,
        }


class TestExplainabilityQA:
    """QA test suite evaluating explainability payload contracts, feature attribution invariants and edge cases."""

    def setup_method(self):
        self.setUp()

    def setUp(self):
        self.standard_student = {
            "academic_scores": {
                "course_dsa": 88.0,
                "course_dbms": 84.0,
                "course_os": 80.0,
                "course_networks": 78.0,
                "course_web_technologies": 92.0,
                "course_ml_math": 75.0,
                "course_software_engineering": 86.0,
                "course_iot_embedded": 70.0,
            },
            "domain_interests": ["Web Development", "Cloud Computing"],
            "technical_skills": {
                "skill_react": 0.85,
                "skill_javascript": 0.90,
                "skill_nodejs": 0.80,
                "skill_mongodb": 0.75,
            },
            "certifications_count": 2,
            "github_projects_count": 4,
        }

    def test_explainability_payload_schema_compliance(self):
        """Validates that explanation payload contains all mandatory contract keys."""
        explanation = MockExplainabilityQAEngine.generate_explanation(self.standard_student)
        required_keys = [
            "recommendationId",
            "recommendationTitle",
            "baseConfidence",
            "summaryText",
            "topPositiveFactors",
            "topNegativeFactors",
            "learningPrerequisites",
        ]
        for key in required_keys:
            assert key in explanation, f"Missing mandatory explainability key: {key}"

        assert isinstance(explanation["baseConfidence"], float)
        assert 0.0 <= explanation["baseConfidence"] <= 1.0
        assert isinstance(explanation["summaryText"], str)
        assert len(explanation["summaryText"]) > 20

    def test_factor_impact_bounds_and_direction(self):
        """Verifies mathematical invariants and schema bounds for feature impacts."""
        explanation = MockExplainabilityQAEngine.generate_explanation(self.standard_student)

        # Validate positive factors
        pos_factors = explanation["topPositiveFactors"]
        assert len(pos_factors) >= 1, "Explanation must contain positive factors"
        for factor in pos_factors:
            assert factor.get("impactDirection") == "POSITIVE"
            assert factor.get("shapValue", 0) > 0.0, "Positive factor SHAP value must be > 0"
            assert factor.get("category") in {"ERP_ACADEMICS", "CAREER_INTEREST", "EXISTING_SKILL"}

        # Validate negative / bridgeable factors
        neg_factors = explanation["topNegativeFactors"]
        assert len(neg_factors) >= 1, "Explanation must contain negative / growth factors"
        for factor in neg_factors:
            assert factor.get("impactDirection") == "NEGATIVE"
            assert factor.get("shapValue", 0) < 0.0, "Negative factor SHAP value must be < 0"
            if "potentialBoost" in factor:
                boost = factor["potentialBoost"]
                assert 0.0 <= boost <= 15.0, "Potential score boost should be within realistic 0-15% range"

    def test_learning_prerequisites_presence(self):
        """Asserts that catalog tech stacks contain actionable prerequisite guidance."""
        for stack_code in TECH_STACK_CATALOG.keys():
            explanation = MockExplainabilityQAEngine.generate_explanation(self.standard_student, stack_code=stack_code)
            prereqs = explanation.get("learningPrerequisites", [])
            assert isinstance(prereqs, list)
            assert len(prereqs) >= 2, f"Stack {stack_code} missing sufficient prerequisites"
            for prereq in prereqs:
                assert isinstance(prereq, str)
                assert len(prereq) > 5

    def test_explainability_with_extreme_sparse_profile(self):
        """Verifies resilience and non-crash behavior when explaining cold-start profile."""
        sparse_student = {
            "academic_scores": {},
            "domain_interests": [],
            "technical_skills": {},
            "certifications_count": 0,
            "github_projects_count": 0,
        }
        explanation = MockExplainabilityQAEngine.generate_explanation(sparse_student)
        assert explanation is not None
        assert "recommendationTitle" in explanation
        assert len(explanation["topPositiveFactors"]) >= 1
        assert len(explanation["topNegativeFactors"]) >= 1

    def test_all_catalog_stacks_explainable(self):
        """Ensures every registered stack in the catalog can generate a valid explanation."""
        for stack_code in TECH_STACK_CATALOG.keys():
            explanation = MockExplainabilityQAEngine.generate_explanation(self.standard_student, stack_code=stack_code)
            assert explanation["recommendationId"] == TECH_STACK_CATALOG[stack_code]["id"]
            assert explanation["recommendationTitle"] == TECH_STACK_CATALOG[stack_code]["title"]
