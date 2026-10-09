"""
Catalog and metadata definitions for recommended technology stacks.
Maintains component technologies, target roles, difficulty levels,
and descriptions aligned with the project data contracts.
"""

from typing import Dict, Any, List

TECH_STACK_CATALOG: Dict[str, Dict[str, Any]] = {
    "MERN_FULL_STACK": {
        "id": "rec-mern-001",
        "stack_code": "MERN_FULL_STACK",
        "title": "Modern Full-Stack Cloud Native",
        "category": "Full-Stack Web & Cloud",
        "difficulty": "Intermediate",
        "estimated_time_to_learn": "8-10 Weeks",
        "target_roles": [
            "Full-Stack Developer",
            "Frontend Engineer",
            "Web Applications Specialist",
            "Software Development Engineer",
        ],
        "technologies": [
            {"name": "React.js", "category": "Frontend", "description": "Component-based UI library"},
            {"name": "Tailwind CSS", "category": "Frontend", "description": "Utility-first CSS framework"},
            {"name": "Node.js & Express", "category": "Backend", "description": "JavaScript backend runtime & server"},
            {"name": "MongoDB", "category": "Database", "description": "Document-oriented NoSQL database"},
            {"name": "Docker & Git", "category": "DevOps", "description": "Containerization and version control"},
        ],
        "summary": "Full-stack web application development specializing in scalable React frontends and Node.js REST services.",
    },
    "AI_ML_ENGINEERING": {
        "id": "rec-aiml-002",
        "stack_code": "AI_ML_ENGINEERING",
        "title": "Applied AI & Intelligent Web Services",
        "category": "AI / ML & API Engineering",
        "difficulty": "Advanced",
        "estimated_time_to_learn": "12-14 Weeks",
        "target_roles": [
            "AI Application Developer",
            "Machine Learning Engineer",
            "MLOps Associate",
            "Data Science Developer",
        ],
        "technologies": [
            {"name": "Python", "category": "Backend", "description": "Core language for ML and data science"},
            {"name": "FastAPI", "category": "Backend", "description": "High-performance Python API framework"},
            {"name": "scikit-learn & PyTorch", "category": "AI_ML", "description": "Machine learning and deep learning models"},
            {"name": "Pandas & NumPy", "category": "AI_ML", "description": "Data manipulation and scientific computing"},
            {"name": "PostgreSQL", "category": "Database", "description": "Relational data store with vector extensions"},
        ],
        "summary": "End-to-end intelligent systems leveraging machine learning models, modern REST APIs, and scalable data pipelines.",
    },
    "IOT_EMBEDDED_SYSTEMS": {
        "id": "rec-iot-003",
        "stack_code": "IOT_EMBEDDED_SYSTEMS",
        "title": "IoT Cloud Gateway & Smart Edge Systems",
        "category": "Internet of Things & Edge Systems",
        "difficulty": "Intermediate",
        "estimated_time_to_learn": "10-12 Weeks",
        "target_roles": [
            "IoT Systems Engineer",
            "Embedded Solutions Developer",
            "Smart Infrastructure Specialist",
            "Firmware Engineer",
        ],
        "technologies": [
            {"name": "ESP32 & Arduino", "category": "IoT", "description": "Microcontroller hardware & firmware"},
            {"name": "C / C++", "category": "Backend", "description": "Low-level systems programming"},
            {"name": "MQTT Protocol", "category": "IoT", "description": "Lightweight messaging for telemetry"},
            {"name": "InfluxDB", "category": "Database", "description": "Time-series telemetry storage"},
            {"name": "React Dashboard", "category": "Frontend", "description": "Real-time telemetry monitoring UI"},
        ],
        "summary": "Hardware-software connected systems integrating microcontrollers, sensor telemetry, and cloud monitoring dashboards.",
    },
    "CLOUD_DEVOPS": {
        "id": "rec-devops-004",
        "stack_code": "CLOUD_DEVOPS",
        "title": "Cloud Native Infrastructure & DevOps",
        "category": "Cloud Infrastructure & SRE",
        "difficulty": "Intermediate",
        "estimated_time_to_learn": "10-12 Weeks",
        "target_roles": [
            "Cloud Engineer",
            "DevOps Engineer",
            "Site Reliability Engineer (SRE)",
            "Platform Engineer",
        ],
        "technologies": [
            {"name": "Docker", "category": "DevOps", "description": "Application containerization"},
            {"name": "Kubernetes", "category": "DevOps", "description": "Container orchestration"},
            {"name": "Linux & Bash", "category": "DevOps", "description": "Systems administration & automation"},
            {"name": "AWS Core Services", "category": "DevOps", "description": "Compute, S3, RDS, IAM"},
            {"name": "GitHub Actions", "category": "DevOps", "description": "Automated CI/CD build pipelines"},
        ],
        "summary": "Modern cloud infrastructure automation, scalable containerized workloads, and continuous integration pipelines.",
    },
    "MOBILE_APP_DEV": {
        "id": "rec-mobile-005",
        "stack_code": "MOBILE_APP_DEV",
        "title": "Cross-Platform Mobile Application Development",
        "category": "Mobile App Engineering",
        "difficulty": "Intermediate",
        "estimated_time_to_learn": "8-10 Weeks",
        "target_roles": [
            "Mobile App Developer",
            "Flutter Engineer",
            "Cross-Platform Specialist",
            "App UI/UX Developer",
        ],
        "technologies": [
            {"name": "Flutter & Dart", "category": "Frontend", "description": "Cross-platform mobile UI framework"},
            {"name": "Firebase", "category": "Backend", "description": "Authentication, Firestore, and cloud messaging"},
            {"name": "REST & GraphQL", "category": "Backend", "description": "Mobile backend integration APIs"},
            {"name": "SQLite / Drift", "category": "Database", "description": "Offline local mobile persistence"},
        ],
        "summary": "Native-performing mobile applications targeting Android and iOS with fluid animations and responsive state management.",
    },
    "DATA_ANALYTICS": {
        "id": "rec-data-006",
        "stack_code": "DATA_ANALYTICS",
        "title": "Data Engineering & Business Analytics",
        "category": "Data Science & BI",
        "difficulty": "Intermediate",
        "estimated_time_to_learn": "8-10 Weeks",
        "target_roles": [
            "Data Analyst",
            "Data Engineer",
            "Business Intelligence Specialist",
            "Database Developer",
        ],
        "technologies": [
            {"name": "Python & Pandas", "category": "AI_ML", "description": "Data wrangling and statistical analysis"},
            {"name": "PostgreSQL & Advanced SQL", "category": "Database", "description": "Complex relational querying and warehousing"},
            {"name": "PowerBI / Tableau", "category": "Frontend", "description": "Executive dashboarding and reporting"},
            {"name": "Apache Spark / DuckDB", "category": "AI_ML", "description": "High-throughput analytics engines"},
        ],
        "summary": "Enterprise data processing, automated ETL workflows, predictive modeling, and executive intelligence dashboards.",
    },
    "CYBERSECURITY": {
        "id": "rec-sec-007",
        "stack_code": "CYBERSECURITY",
        "title": "Security Engineering & Network Defense",
        "category": "Cybersecurity & Infrastructure",
        "difficulty": "Advanced",
        "estimated_time_to_learn": "12-14 Weeks",
        "target_roles": [
            "Security Analyst",
            "Cybersecurity Engineer",
            "Network Defense Specialist",
            "SOC Analyst",
        ],
        "technologies": [
            {"name": "Linux Security & Scripting", "category": "DevOps", "description": "Hardening and shell automation"},
            {"name": "Python Security Tools", "category": "Backend", "description": "Network scanning and automated auditing"},
            {"name": "Wireshark & Tcpdump", "category": "DevOps", "description": "Packet inspection and protocol analysis"},
            {"name": "Cryptography & OpenSSL", "category": "Backend", "description": "Encryption, TLS, and token security"},
        ],
        "summary": "Defensive security architecture, network traffic vulnerability assessment, and secure protocol enforcement.",
    },
}


def get_stack_metadata(stack_code: str) -> Dict[str, Any]:
    """Retrieves full metadata for a given stack code, with defensive fallback."""
    if stack_code in TECH_STACK_CATALOG:
        return dict(TECH_STACK_CATALOG[stack_code])
    return {
        "id": f"rec-{stack_code.lower()}",
        "stack_code": stack_code,
        "title": stack_code.replace("_", " ").title(),
        "category": "Software Engineering",
        "difficulty": "Intermediate",
        "estimated_time_to_learn": "8-10 Weeks",
        "target_roles": ["Software Developer"],
        "technologies": [],
        "summary": "Recommended technology stack based on student profile.",
    }
