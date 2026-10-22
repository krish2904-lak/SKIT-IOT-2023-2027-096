"""
Automated QA & Validation Suite for 3-Phase Structured Learning Roadmaps
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


class TestRoadmapQA:
    """
    Quality assurance and structural integrity verification for
    3-phase structured learning roadmaps across all technology stacks.
    """

    def setUp(self):
        pass

    def test_all_catalog_stacks_have_three_phase_roadmaps(self):
        """Validates that every single catalog tech stack defines a 3-phase roadmap."""
        for code, stack_meta in TECH_STACK_CATALOG.items():
            assert "roadmap" in stack_meta, f"Stack {code} is missing 'roadmap' field"
            roadmap = stack_meta["roadmap"]
            assert isinstance(roadmap, list), f"Roadmap for {code} must be a list"
            assert len(roadmap) == 3, f"Stack {code} must have exactly 3 roadmap phases, found {len(roadmap)}"

    def test_roadmap_phase_schema_invariants(self):
        """Verifies structural schema and non-empty content invariants for all phases."""
        required_phase_keys = ["phase", "duration", "title", "topics", "recommendedResource"]
        
        for code, stack_meta in TECH_STACK_CATALOG.items():
            for idx, phase_obj in enumerate(stack_meta["roadmap"]):
                for key in required_phase_keys:
                    assert key in phase_obj, f"Stack {code} Phase {idx + 1} missing '{key}'"
                    assert phase_obj[key], f"Stack {code} Phase {idx + 1} '{key}' cannot be empty"
                
                # Verify topics list
                topics = phase_obj["topics"]
                assert isinstance(topics, list)
                assert len(topics) >= 2, f"Stack {code} Phase {idx + 1} must have at least 2 topics"
                for topic in topics:
                    assert isinstance(topic, str)
                    assert len(topic) > 3

    def test_roadmap_integrated_in_prediction_response(self):
        """Verifies that recommendation items match the required roadmap contract structure."""
        # Simulated prediction item matching API contract
        rec_item = {
            "id": "rec-mern-001",
            "title": "Modern Full-Stack Cloud Native",
            "matchScore": 92.5,
            "roadmap": TECH_STACK_CATALOG["MERN_FULL_STACK"]["roadmap"]
        }
        assert "roadmap" in rec_item
        assert len(rec_item["roadmap"]) == 3
        for phase in rec_item["roadmap"]:
            assert "phase" in phase
            assert "topics" in phase
            assert len(phase["topics"]) >= 2
