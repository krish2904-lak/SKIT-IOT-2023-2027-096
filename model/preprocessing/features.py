"""
Feature definitions, schemas, and taxonomies for the Tech-Stack Recommendation System.
Defines standardized vocabularies for ERP academic coursework, student skills,
interest domains, and target recommendation categories.
"""

from typing import List, Dict

# ERP Academic Course Marks (0 - 100 range)
ACADEMIC_COURSES: List[str] = [
    "web_technologies",
    "dbms",
    "dsa",
    "iot_embedded",
    "ml_math",
    "cloud_computing",
    "operating_systems",
]

# Standardized Interest Domains
INTEREST_DOMAINS: List[str] = [
    "web_development",
    "ai_ml",
    "iot_embedded",
    "cloud_devops",
    "mobile_dev",
    "data_analytics",
    "cybersecurity",
]

# Standardized Technical Skills Vocabulary
TECHNICAL_SKILLS: List[str] = [
    # Languages
    "python",
    "javascript",
    "typescript",
    "java",
    "cpp",
    "c",
    "sql",
    "html_css",
    # Frameworks & Libraries
    "react",
    "nodejs",
    "express",
    "fastapi",
    "django",
    "flask",
    "pytorch",
    "tensorflow",
    "scikit_learn",
    "flutter",
    # Databases & Storage
    "mongodb",
    "postgresql",
    "mysql",
    "influxdb",
    # Infrastructure & DevOps
    "docker",
    "kubernetes",
    "aws",
    "linux",
    "git",
    # IoT & Embedded Systems
    "arduino",
    "esp32",
    "mqtt",
    "raspberry_pi",
]

# Aliases and canonical name mapping for flexible matching (case-insensitive)
SKILL_ALIASES: Dict[str, str] = {
    "py": "python",
    "python3": "python",
    "js": "javascript",
    "ts": "typescript",
    "c++": "cpp",
    "c/c++": "cpp",
    "c#": "cpp",
    "golang": "python",
    "html": "html_css",
    "css": "html_css",
    "html5": "html_css",
    "css3": "html_css",
    "tailwind": "html_css",
    "reactjs": "react",
    "react.js": "react",
    "node": "nodejs",
    "node.js": "nodejs",
    "express.js": "express",
    "expressjs": "express",
    "scikit-learn": "scikit_learn",
    "sklearn": "scikit_learn",
    "torch": "pytorch",
    "tf": "tensorflow",
    "mongo": "mongodb",
    "postgres": "postgresql",
    "postgres_db": "postgresql",
    "k8s": "kubernetes",
    "amazon web services": "aws",
    "esp-32": "esp32",
    "esp8266": "esp32",
    "raspi": "raspberry_pi",
    "rpi": "raspberry_pi",
}

INTEREST_ALIASES: Dict[str, str] = {
    "web dev": "web_development",
    "web development": "web_development",
    "frontend": "web_development",
    "full stack": "web_development",
    "fullstack": "web_development",
    "machine learning": "ai_ml",
    "artificial intelligence": "ai_ml",
    "deep learning": "ai_ml",
    "ai/ml": "ai_ml",
    "ai": "ai_ml",
    "ml": "ai_ml",
    "iot": "iot_embedded",
    "internet of things": "iot_embedded",
    "embedded": "iot_embedded",
    "embedded systems": "iot_embedded",
    "devops": "cloud_devops",
    "cloud": "cloud_devops",
    "cloud computing": "cloud_devops",
    "cloud & devops": "cloud_devops",
    "mobile": "mobile_dev",
    "app development": "mobile_dev",
    "android": "mobile_dev",
    "flutter": "mobile_dev",
    "data science": "data_analytics",
    "data analysis": "data_analytics",
    "analytics": "data_analytics",
    "big data": "data_analytics",
    "security": "cybersecurity",
    "cyber security": "cybersecurity",
    "infosec": "cybersecurity",
    "ethical hacking": "cybersecurity",
}

# Skill proficiency levels mapping
SKILL_LEVEL_WEIGHTS: Dict[str, float] = {
    "beginner": 1.0,
    "intermediate": 2.0,
    "advanced": 3.0,
}

# Target Tech-Stack Recommendation Labels
TARGET_STACKS: List[str] = [
    "MERN_FULL_STACK",
    "AI_ML_ENGINEERING",
    "IOT_EMBEDDED_SYSTEMS",
    "CLOUD_DEVOPS",
    "MOBILE_APP_DEV",
    "DATA_ANALYTICS",
    "CYBERSECURITY",
]
