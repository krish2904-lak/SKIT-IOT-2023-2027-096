"""
Dataset generator for the Tech-Stack Recommendation System.
Generates reproducible, statistically grounded student training records
based on academic performance (ERP), technical skills, interest domains,
and corresponding target technology stack recommendations.
"""

import json
import random
from pathlib import Path
from typing import List, Dict, Any
import numpy as np
import pandas as pd

from model.preprocessing.features import (
    ACADEMIC_COURSES,
    INTEREST_DOMAINS,
    TARGET_STACKS,
)

SEED = 42
random.seed(SEED)
np.random.seed(SEED)

DATA_DIR = Path(__file__).resolve().parent

# Profiles archetypes mapping target stacks to characteristic affinities
STACK_ARCHETYPES = {
    "MERN_FULL_STACK": {
        "primary_interest": "web_development",
        "secondary_interests": ["cloud_devops", "mobile_dev"],
        "core_skills": [("javascript", "advanced"), ("react", "intermediate"), ("html_css", "advanced"), ("nodejs", "intermediate"), ("mongodb", "intermediate")],
        "bonus_skills": ["typescript", "express", "git", "docker"],
        "course_boosts": {"web_technologies": 18, "dbms": 10, "dsa": 6},
    },
    "AI_ML_ENGINEERING": {
        "primary_interest": "ai_ml",
        "secondary_interests": ["data_analytics", "cloud_devops"],
        "core_skills": [("python", "advanced"), ("scikit_learn", "intermediate"), ("pytorch", "intermediate"), ("sql", "intermediate")],
        "bonus_skills": ["tensorflow", "fastapi", "git", "linux", "docker"],
        "course_boosts": {"ml_math": 20, "dsa": 10, "dbms": 8},
    },
    "IOT_EMBEDDED_SYSTEMS": {
        "primary_interest": "iot_embedded",
        "secondary_interests": ["cloud_devops", "cybersecurity"],
        "core_skills": [("cpp", "advanced"), ("esp32", "intermediate"), ("arduino", "advanced"), ("mqtt", "intermediate"), ("c", "intermediate")],
        "bonus_skills": ["python", "influxdb", "linux", "raspberry_pi"],
        "course_boosts": {"iot_embedded": 22, "operating_systems": 12, "dsa": 6},
    },
    "CLOUD_DEVOPS": {
        "primary_interest": "cloud_devops",
        "secondary_interests": ["cybersecurity", "web_development"],
        "core_skills": [("docker", "advanced"), ("linux", "advanced"), ("aws", "intermediate"), ("kubernetes", "intermediate"), ("git", "advanced")],
        "bonus_skills": ["python", "nodejs", "sql"],
        "course_boosts": {"cloud_computing": 22, "operating_systems": 16, "dbms": 8},
    },
    "MOBILE_APP_DEV": {
        "primary_interest": "mobile_dev",
        "secondary_interests": ["web_development", "cloud_devops"],
        "core_skills": [("flutter", "advanced"), ("java", "intermediate"), ("javascript", "intermediate"), ("git", "intermediate")],
        "bonus_skills": ["typescript", "react", "sql"],
        "course_boosts": {"dsa": 14, "web_technologies": 12, "dbms": 8},
    },
    "DATA_ANALYTICS": {
        "primary_interest": "data_analytics",
        "secondary_interests": ["ai_ml", "web_development"],
        "core_skills": [("python", "advanced"), ("sql", "advanced"), ("postgresql", "intermediate"), ("mysql", "intermediate")],
        "bonus_skills": ["scikit_learn", "git", "mongodb"],
        "course_boosts": {"dbms": 20, "ml_math": 14, "dsa": 8},
    },
    "CYBERSECURITY": {
        "primary_interest": "cybersecurity",
        "secondary_interests": ["cloud_devops", "iot_embedded"],
        "core_skills": [("linux", "advanced"), ("python", "intermediate"), ("cpp", "intermediate"), ("git", "intermediate")],
        "bonus_skills": ["docker", "c", "aws"],
        "course_boosts": {"operating_systems": 20, "cloud_computing": 12, "dsa": 10},
    },
}

BRANCHES = ["CSE (IoT)", "CSE", "CSE (AI/ML)", "Information Technology"]


def generate_student_record(student_num: int, target_stack: str) -> Dict[str, Any]:
    """Generates a single consistent, realistic student record."""
    archetype = STACK_ARCHETYPES[target_stack]

    # Student base metadata
    student_id = f"SKIT/2023/CSE/{student_num:04d}"
    branch = "CSE (IoT)" if target_stack == "IOT_EMBEDDED_SYSTEMS" and random.random() < 0.65 else random.choice(BRANCHES)
    semester = random.choice([5, 6, 7])

    # Base academic capability
    base_cgpa = float(np.clip(np.random.normal(7.8, 0.9), 5.5, 9.8))
    base_score = float(base_cgpa * 9.5)  # approximate conversion to 100-scale

    # Academic courses with subject-level variance and archetype boost
    academic_scores = {}
    for course in ACADEMIC_COURSES:
        boost = archetype["course_boosts"].get(course, 0)
        noise = np.random.normal(0, 5.0)
        score = base_score + boost + noise
        academic_scores[course] = float(np.clip(score, 40.0, 99.0))

    # Interests: Primary from archetype + optional secondary
    interests = [archetype["primary_interest"]]
    if random.random() < 0.70:
        sec = random.choice(archetype["secondary_interests"])
        if sec not in interests:
            interests.append(sec)
    if random.random() < 0.15:
        third = random.choice(INTEREST_DOMAINS)
        if third not in interests:
            interests.append(third)

    # Skills: Core skills with occasional variance
    skills = []
    for skill_name, level in archetype["core_skills"]:
        if random.random() < 0.92:
            skills.append({"name": skill_name, "level": level})

    for skill_name in archetype["bonus_skills"]:
        if random.random() < 0.50:
            level = random.choice(["beginner", "intermediate"])
            skills.append({"name": skill_name, "level": level})

    # Projects and certifications
    projects_completed = int(np.clip(np.random.poisson(2.5), 0, 8))
    certifications_count = int(np.clip(np.random.poisson(1.2), 0, 5))

    return {
        "student_id": student_id,
        "branch": branch,
        "semester": semester,
        "cgpa": round(base_cgpa, 2),
        "web_technologies_score": round(academic_scores["web_technologies"], 1),
        "dbms_score": round(academic_scores["dbms"], 1),
        "dsa_score": round(academic_scores["dsa"], 1),
        "iot_embedded_score": round(academic_scores["iot_embedded"], 1),
        "ml_math_score": round(academic_scores["ml_math"], 1),
        "cloud_computing_score": round(academic_scores["cloud_computing"], 1),
        "operating_systems_score": round(academic_scores["operating_systems"], 1),
        "interests": ",".join(interests),
        "skills": json.dumps(skills),
        "projects_completed": projects_completed,
        "certifications_count": certifications_count,
        "target_tech_stack": target_stack,
    }


def generate_dataset(num_records: int = 1000) -> pd.DataFrame:
    """Generates a balanced dataset across all target technology stacks."""
    records_per_stack = num_records // len(TARGET_STACKS)
    remainder = num_records % len(TARGET_STACKS)

    records = []
    student_counter = 1

    for i, stack in enumerate(TARGET_STACKS):
        count = records_per_stack + (1 if i < remainder else 0)
        for _ in range(count):
            rec = generate_student_record(student_counter, stack)
            records.append(rec)
            student_counter += 1

    # Shuffle the dataset
    random.shuffle(records)
    df = pd.DataFrame(records)
    return df


def save_dataset(output_path: Path = None, num_records: int = 1000) -> Path:
    """Generates and writes the training dataset CSV to disk."""
    if output_path is None:
        output_path = DATA_DIR / "student_tech_stack_dataset.csv"

    df = generate_dataset(num_records)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} records saved to {output_path}")
    return output_path


if __name__ == "__main__":
    save_dataset()
