"""
Standardized human-readable label map and phrasing taxonomy for all 48 model features.
Derived from docs/dataset-and-features.md and model/preprocessing/features.py.
"""

from typing import Dict

# Human-readable labels for all 48 normalized features
FEATURE_LABELS: Dict[str, str] = {
    # Academic Performance (ERP Records)
    "cgpa": "Overall Academic CGPA",
    "course_web_technologies": "Web Technologies Coursework",
    "course_dbms": "Database Management Systems (DBMS) Coursework",
    "course_dsa": "Data Structures & Algorithms (DSA) Coursework",
    "course_iot_embedded": "IoT & Embedded Systems Coursework",
    "course_ml_math": "Machine Learning & Mathematics Coursework",
    "course_cloud_computing": "Cloud Computing Coursework",
    "course_operating_systems": "Operating Systems Coursework",

    # Career Interest Domains
    "interest_web_development": "Interest in Web Development",
    "interest_ai_ml": "Interest in Artificial Intelligence & ML",
    "interest_iot_embedded": "Interest in IoT & Embedded Hardware",
    "interest_cloud_devops": "Interest in Cloud & DevOps",
    "interest_mobile_dev": "Interest in Mobile App Development",
    "interest_data_analytics": "Interest in Data Analytics & Engineering",
    "interest_cybersecurity": "Interest in Cybersecurity & Network Defense",

    # Technical Skills - Languages
    "skill_python": "Python Programming Skill",
    "skill_javascript": "JavaScript Programming Skill",
    "skill_typescript": "TypeScript Programming Skill",
    "skill_java": "Java Programming Skill",
    "skill_cpp": "C++ Systems Programming Skill",
    "skill_c": "C Programming Skill",
    "skill_sql": "SQL Database Querying Skill",
    "skill_html_css": "HTML/CSS & Web Layout Skill",

    # Technical Skills - Frameworks & Libraries
    "skill_react": "React.js Frontend Framework Skill",
    "skill_nodejs": "Node.js Runtime Skill",
    "skill_express": "Express.js Backend Framework Skill",
    "skill_fastapi": "FastAPI Microservice Framework Skill",
    "skill_django": "Django Web Framework Skill",
    "skill_flask": "Flask Microframework Skill",
    "skill_pytorch": "PyTorch Deep Learning Skill",
    "skill_tensorflow": "TensorFlow ML Library Skill",
    "skill_scikit_learn": "Scikit-Learn ML Library Skill",
    "skill_flutter": "Flutter Mobile UI Skill",

    # Technical Skills - Databases & Storage
    "skill_mongodb": "MongoDB NoSQL Database Skill",
    "skill_postgresql": "PostgreSQL Relational Database Skill",
    "skill_mysql": "MySQL Database Skill",
    "skill_influxdb": "InfluxDB Time-Series Database Skill",

    # Technical Skills - Infrastructure & DevOps
    "skill_docker": "Docker Containerization Skill",
    "skill_kubernetes": "Kubernetes Orchestration Skill",
    "skill_aws": "Amazon Web Services (AWS) Cloud Skill",
    "skill_linux": "Linux Systems & CLI Skill",
    "skill_git": "Git Version Control Skill",

    # Technical Skills - IoT & Embedded
    "skill_arduino": "Arduino Prototyping Skill",
    "skill_esp32": "ESP32 Microcontroller Skill",
    "skill_mqtt": "MQTT Telemetry Messaging Skill",
    "skill_raspberry_pi": "Raspberry Pi Single-Board Computer Skill",

    # Experience & Portfolio Attributes
    "projects_completed": "Completed Engineering Projects",
    "certifications_count": "Technical Certifications Count",
}


def get_feature_label(feature_name: str) -> str:
    """Returns human-readable label for a feature with clean fallback."""
    if feature_name in FEATURE_LABELS:
        return FEATURE_LABELS[feature_name]
    # Fallback to title-cased token
    clean = feature_name.replace("skill_", "").replace("course_", "").replace("interest_", "")
    return clean.replace("_", " ").title()
