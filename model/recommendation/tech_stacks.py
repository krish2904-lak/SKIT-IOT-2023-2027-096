"""
Catalog and metadata definitions for recommended technology stacks.
Maintains component technologies, target roles, difficulty levels,
learning roadmaps, and descriptions aligned with project data contracts.
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
        "roadmap": [
            {
                "phase": "Phase 1: Architecture & UI Engineering",
                "duration": "Weeks 1-3",
                "title": "Modern TypeScript + React 19 Ecosystem",
                "topics": [
                    "Custom Hooks & Context State",
                    "Tailwind Utility Architecture",
                    "Client Performance & Vite Bundling",
                ],
                "recommendedResource": "SKIT Web Dev Lab Manual & FullStackOpen Part 1-5",
            },
            {
                "phase": "Phase 2: RESTful Microservices & Persistence",
                "duration": "Weeks 4-6",
                "title": "Node.js Express + MongoDB Atlas Integration",
                "topics": [
                    "JWT Authentication & Middleware",
                    "Mongoose Schema Design & Indexing",
                    "Microservice API Gateway Patterns",
                ],
                "recommendedResource": "Official Node.js Docs & MongoDB University M220JS",
            },
            {
                "phase": "Phase 3: Cloud Native Deployment & DevOps",
                "duration": "Weeks 7-9",
                "title": "Containerization with Docker & Cloud Hosting",
                "topics": [
                    "Multi-Stage Dockerfiles",
                    "GitHub Actions CI/CD Pipeline",
                    "AWS EC2 / Vercel Production Deployments",
                ],
                "recommendedResource": "Docker Deep Dive & AWS Academy Cloud Foundations",
            },
        ],
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
        "roadmap": [
            {
                "phase": "Phase 1: Supervised ML & Feature Engineering",
                "duration": "Weeks 1-4",
                "title": "Random Forest & Supervised Learning Foundations",
                "topics": [
                    "Data Imputation & MinMax Scaling",
                    "Stratified K-Fold Cross-Validation",
                    "Feature Importance & Model Evaluation Metrics",
                ],
                "recommendedResource": "scikit-learn user guide & Hands-On Machine Learning (Géron)",
            },
            {
                "phase": "Phase 2: High-Performance Model Serving",
                "duration": "Weeks 5-8",
                "title": "FastAPI Asynchronous Microservice Architecture",
                "topics": [
                    "Pydantic Data Contracts & Schemas",
                    "Joblib Model Serialization & In-Memory Singletons",
                    "Sub-50ms Inference Endpoints & CORS Gateways",
                ],
                "recommendedResource": "FastAPI in Production by Sebastián Ramírez",
            },
            {
                "phase": "Phase 3: Explainable AI & Deep Learning",
                "duration": "Weeks 9-12",
                "title": "Transparent Explainability & Neural Foundations",
                "topics": [
                    "Feature Attribution & Waterfall Visualizations",
                    "Data Drift Detection & Feedback Monitoring",
                    "PyTorch Neural Network Prototyping",
                ],
                "recommendedResource": "Explainable Machine Learning in Practice (Springer)",
            },
        ],
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
        "roadmap": [
            {
                "phase": "Phase 1: Sensor Interfacing & Protocols",
                "duration": "Weeks 1-4",
                "title": "Microcontroller Programming & MQTT Brokers",
                "topics": [
                    "ESP32 / Arduino C++ Fundamentals",
                    "MQTT Publish/Subscribe Topologies (Mosquitto)",
                    "Sensor Calibration (DHT22, Ultrasonic, I2C/SPI)",
                ],
                "recommendedResource": "SKIT IoT Lab Syllabus (Sem 5-6)",
            },
            {
                "phase": "Phase 2: Stream Ingestion & Time-Series DB",
                "duration": "Weeks 5-8",
                "title": "InfluxDB + Node-RED Telemetry Pipeline",
                "topics": [
                    "Telegraf Metrics Ingestion Agents",
                    "Flux Query Language & Downsampling",
                    "Edge-to-Cloud Telemetry Streaming",
                ],
                "recommendedResource": "InfluxData IoT Architecture Guides",
            },
            {
                "phase": "Phase 3: Telemetry Visualization Web Client",
                "duration": "Weeks 9-11",
                "title": "WebSocket Live Dashboards & Alerts",
                "topics": [
                    "Real-Time Canvas Telemetry Visualizers",
                    "Device Anomaly Alert Thresholds",
                    "Hardware-in-the-Loop Capstone Project",
                ],
                "recommendedResource": "React + WebSockets IoT Showcase Tutorials",
            },
        ],
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
        "roadmap": [
            {
                "phase": "Phase 1: Linux Internals & Containerization",
                "duration": "Weeks 1-4",
                "title": "Docker Container Architecture & Shell Automation",
                "topics": [
                    "Multi-Stage Dockerfile Optimization",
                    "Linux Kernel Namespaces & cgroups",
                    "Container Networking & Storage Volumes",
                ],
                "recommendedResource": "The Linux Command Line by William Shotts & Docker Deep Dive",
            },
            {
                "phase": "Phase 2: Container Orchestration & IaC",
                "duration": "Weeks 5-8",
                "title": "Kubernetes Clusters & Infrastructure as Code",
                "topics": [
                    "Pods, Deployments, Services & Ingress",
                    "Helm Package Management",
                    "Terraform AWS Resource Provisioning",
                ],
                "recommendedResource": "Kubernetes Up & Running (Kelsey Hightower) & HashiCorp Learn",
            },
            {
                "phase": "Phase 3: Automated CI/CD & Observability",
                "duration": "Weeks 9-12",
                "title": "GitHub Actions, Prometheus & Grafana Monitoring",
                "topics": [
                    "Automated Test & Release Pipelines",
                    "Prometheus Metrics Exporters & Scrape Configs",
                    "Grafana Dashboards & SRE Alerting Rules",
                ],
                "recommendedResource": "Google Site Reliability Engineering (SRE) Handbook",
            },
        ],
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
        "roadmap": [
            {
                "phase": "Phase 1: Flutter & Dart Foundations",
                "duration": "Weeks 1-3",
                "title": "Reactive Mobile UI Design & Layouts",
                "topics": [
                    "Dart Object-Oriented Semantics",
                    "Stateless vs. Stateful Widget Tree",
                    "Responsive Mobile Layouts & Material Design 3",
                ],
                "recommendedResource": "Official Flutter Apprentice & Dart Language Tour",
            },
            {
                "phase": "Phase 2: State Management & Offline Persistence",
                "duration": "Weeks 4-7",
                "title": "BLoC / Riverpod Architecture & SQLite",
                "topics": [
                    "Predictable State Flow Patterns",
                    "Local Storage with SQLite/Drift",
                    "REST API Integration & Offline Synchronization",
                ],
                "recommendedResource": "Flutter Engineering Tutorials by Andrea Bizzotto",
            },
            {
                "phase": "Phase 3: Firebase Integration & App Release",
                "duration": "Weeks 8-10",
                "title": "Cloud Backend & Store Deployment Pipelines",
                "topics": [
                    "Firebase Authentication & Cloud Firestore",
                    "Push Notifications (FCM)",
                    "Play Store & TestFlight Release Packaging",
                ],
                "recommendedResource": "Google Developers Mobile Certification Guide",
            },
        ],
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
        "roadmap": [
            {
                "phase": "Phase 1: Advanced SQL & Relational Warehousing",
                "duration": "Weeks 1-3",
                "title": "Complex Analytical Querying & Schemas",
                "topics": [
                    "Window Functions, CTEs & Recursive Queries",
                    "Star & Snowflake Schema Data Modeling",
                    "Query Execution Plans & B-Tree Index Optimization",
                ],
                "recommendedResource": "Mode Analytics SQL Tutorial & PostgreSQL Documentation",
            },
            {
                "phase": "Phase 2: Python Data Engineering & ETL",
                "duration": "Weeks 4-7",
                "title": "Automated ETL Pipelines with Pandas & DuckDB",
                "topics": [
                    "Data Cleaning & Anomaly Imputation",
                    "High-Performance Columnar Queries with DuckDB",
                    "Scheduled Automated Batch Ingestion",
                ],
                "recommendedResource": "Python for Data Analysis by Wes McKinney",
            },
            {
                "phase": "Phase 3: BI Dashboards & Storytelling",
                "duration": "Weeks 8-10",
                "title": "PowerBI / Tableau Executive KPI Dashboards",
                "topics": [
                    "DAX Analytical Formulas & Calculations",
                    "Interactive Visual Drill-downs & Slicers",
                    "Data Storytelling & Executive Summaries",
                ],
                "recommendedResource": "Microsoft PowerBI PL-300 Certification Material",
            },
        ],
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
        "roadmap": [
            {
                "phase": "Phase 1: Network Protocols & Packet Inspection",
                "duration": "Weeks 1-4",
                "title": "Packet Analysis & Firewall Hardening",
                "topics": [
                    "TCP/IP Handshake & Protocol Dissection",
                    "Wireshark Capture Filters & Traffic Baselines",
                    "Linux iptables, UFW & Host Hardening",
                ],
                "recommendedResource": "CompTIA Security+ Study Guide & Wireshark Certified Network Analyst",
            },
            {
                "phase": "Phase 2: Security Automation & Cryptography",
                "duration": "Weeks 5-8",
                "title": "Python Security Scripting & Encryption",
                "topics": [
                    "Automated Vulnerability Scanning with Nmap/Python",
                    "Symmetric (AES) & Asymmetric (RSA/ECC) Cryptography",
                    "TLS Certificate Chains & Public Key Infrastructure (PKI)",
                ],
                "recommendedResource": "Violent Python & Serious Cryptography by Jean-Philippe Aumasson",
            },
            {
                "phase": "Phase 3: SOC Operations & Incident Response",
                "duration": "Weeks 9-12",
                "title": "Blue Team Defenses & Threat Detection",
                "topics": [
                    "SIEM Log Analysis (Elasticsearch / Splunk)",
                    "MITRE ATT&CK Framework Mapping",
                    "Incident Response Runbooks & Post-Mortems",
                ],
                "recommendedResource": "SANS Blue Team Handbook & OWASP Top 10 Guides",
            },
        ],
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
        "roadmap": [
            {
                "phase": "Phase 1: Core Fundamentals",
                "duration": "Weeks 1-3",
                "title": "Foundation Concepts",
                "topics": ["Syntax & Paradigms", "Standard Libraries"],
                "recommendedResource": "Official Documentation",
            },
            {
                "phase": "Phase 2: Intermediate Implementation",
                "duration": "Weeks 4-6",
                "title": "Frameworks & Tooling",
                "topics": ["Architecture Patterns", "API Integration"],
                "recommendedResource": "Community Courses & Tutorials",
            },
            {
                "phase": "Phase 3: Advanced Deployment",
                "duration": "Weeks 7-9",
                "title": "Production Deployment",
                "topics": ["Testing & Performance", "Cloud Deployment"],
                "recommendedResource": "Production Case Studies",
            },
        ],
    }
