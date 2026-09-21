import pytest
from typing import Dict, Any, List

@pytest.fixture
def sample_erp_record() -> Dict[str, Any]:
    """Fixture providing a mock academic ERP record for testing."""
    return {
        "student_id": "STU-2023-096",
        "name": "Test Student",
        "sgpa_sem1": 8.4,
        "sgpa_sem2": 8.6,
        "sgpa_sem3": 8.8,
        "sgpa_sem4": 8.7,
        "cgpa": 8.62,
        "attendance_percentage": 89.5,
        "dsa_marks": 88,
        "dbms_marks": 84,
        "os_marks": 82,
        "cn_marks": 79,
        "web_tech_marks": 91
    }

@pytest.fixture
def sample_student_input() -> Dict[str, Any]:
    """Fixture providing student preferences, skills, and portfolio input."""
    return {
        "student_id": "STU-2023-096",
        "domain_interests": ["Web Development", "Cloud & DevOps"],
        "technical_skills": {
            "python": 0.8,
            "javascript": 0.9,
            "react": 0.85,
            "node": 0.75,
            "docker": 0.6,
            "git": 0.9
        },
        "certifications_count": 2,
        "github_projects_count": 4,
        "hackathons_count": 1,
        "preferred_work_style": "collaborative"
    }

@pytest.fixture
def expected_tech_stacks() -> List[str]:
    """Fixture listing the 7 target technology stack classes."""
    return [
        "Full-Stack Web Development",
        "Mobile Application Development",
        "AI & Machine Learning",
        "Cloud Computing & DevOps",
        "Cybersecurity & Networks",
        "Data Science & Analytics",
        "IoT & Embedded Systems"
    ]
