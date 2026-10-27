"""
Deterministic skill and metadata fallback extractor for student resumes.
Performs regex and taxonomy-based pattern matching against canonical skill vocabularies
and the 7 target technology stack ecosystems without requiring an external LLM API.
"""

import re
from typing import Dict, List, Set, Any, Tuple
from model.preprocessing.features import (
    TECHNICAL_SKILLS,
    SKILL_ALIASES,
    INTEREST_DOMAINS,
    INTEREST_ALIASES,
)
from model.recommendation.tech_stacks import TECH_STACK_CATALOG
from .schemas import ExtractedSkill, ResumeExtractionResult


# Specific regex patterns for skills requiring careful word boundary delimiters
# (e.g. C, C++, C#, SQL, R, Go, etc.)
SKILL_REGEX_PATTERNS: Dict[str, str] = {
    "c": r"\b[Cc]\b(?![+#])",
    "cpp": r"\b(cpp|c\+\+|c/c\+\+)(?!\+)",
    "html_css": r"\b(html|css|html5|css3|html/css|tailwind|bootstrap)\b",
    "git": r"\b(git|github|gitlab)\b",
    "aws": r"\b(aws|amazon web services|ec2|s3|lambda)\b",
    "ci_cd": r"\b(ci/cd|github actions|jenkins)\b",
    "scikit_learn": r"\b(scikit-learn|sklearn)\b",
    "nodejs": r"\b(node\.?js|node)\b",
    "react": r"\b(react\.?js|react|react-native)\b",
    "express": r"\b(express\.?js|express)\b",
    "fastapi": r"\b(fastapi)\b",
    "django": r"\b(django)\b",
    "flask": r"\b(flask)\b",
    "pytorch": r"\b(pytorch|torch)\b",
    "tensorflow": r"\b(tensorflow|tf)\b",
    "mongodb": r"\b(mongodb|mongo)\b",
    "postgresql": r"\b(postgresql|postgres|psql)\b",
    "mysql": r"\b(mysql)\b",
    "influxdb": r"\b(influxdb|influx)\b",
    "docker": r"\b(docker|containerization)\b",
    "kubernetes": r"\b(kubernetes|k8s)\b",
    "linux": r"\b(linux|ubuntu|bash|shell)\b",
    "arduino": r"\b(arduino)\b",
    "esp32": r"\b(esp32|esp8266|esp-32)\b",
    "mqtt": r"\b(mqtt|mosquitto)\b",
    "raspberry_pi": r"\b(raspberry\s*pi|raspi|rpi)\b",
    "flutter": r"\b(flutter|dart)\b",
    "sql": r"\b(sql|rdbms|relational database)\b",
    "python": r"\b(python|python3|py)\b",
    "javascript": r"\b(javascript|js|es6)\b",
    "typescript": r"\b(typescript|ts)\b",
    "java": r"\b(java)\b(?!\s*script)",
}

# Proficiency level detection keywords
ADVANCED_KEYWORDS = {"advanced", "expert", "senior", "lead", "proficient", "master", "extensive", "3+ years", "4+ years", "5+ years"}
BEGINNER_KEYWORDS = {"beginner", "basic", "familiar", "novice", "introductory", "learning", "elementary", "fundamental"}

# Experience level detection patterns
SENIOR_PATTERNS = [r"\bsenior\b", r"\blead\b", r"\b4\+\s*years\b", r"\b5\+\s*years\b"]
BEGINNER_PATTERNS = [r"\bintern\b", r"\bfresher\b", r"\bstudent\b", r"\bentry\s*level\b", r"\bjunior\b", r"\bundergraduate\b"]

# Project header patterns
PROJECT_PATTERNS = [
    r"(?i)\bprojects?\b",
    r"(?i)\bacademic projects?\b",
    r"(?i)\bpersonal projects?\b",
    r"(?i)\bkey projects?\b",
]

# Certification keywords
CERT_KEYWORDS = [
    r"(?i)\bcertif(ied|ication|icates?)\b",
    r"(?i)\bcoursera\b",
    r"(?i)\budemy\b",
    r"(?i)\bhackerrank\b",
    r"(?i)\bleetcode\b",
    r"(?i)\bnptel\b",
    r"(?i)\baws certified\b",
    r"(?i)\bgcp certified\b",
]


class FallbackResumeExtractor:
    """
    Deterministic rule-based extractor using regex and canonical taxonomies.
    Guarantees fast, offline, and 100% reproducible skill extraction.
    """

    @classmethod
    def extract(cls, text: str) -> ResumeExtractionResult:
        """Parses resume text and returns structured extraction result."""
        text_lower = text.lower()

        # 1. Extract Skills
        extracted_skills = cls._extract_skills(text, text_lower)

        # 2. Extract Domains
        extracted_domains = cls._extract_domains(text_lower)

        # 3. Detect Projects
        projects, projects_count = cls._extract_projects(text)

        # 4. Detect Certifications
        certifications_count = cls._count_certifications(text)

        # 5. Estimate Experience Level
        experience_level = cls._estimate_experience_level(text_lower)

        return ResumeExtractionResult(
            skills=extracted_skills,
            projects=projects,
            projects_count=projects_count,
            certifications_count=certifications_count,
            experience_level=experience_level,
            domains=extracted_domains,
            extraction_method="deterministic_fallback",
        )

    @classmethod
    def _extract_skills(cls, text: str, text_lower: str) -> List[ExtractedSkill]:
        """Scans text for canonical skills and determines contextual proficiency levels."""
        detected_skills: Dict[str, str] = {}  # skill_token -> level

        # Check customized regexes
        for skill_token, pattern in SKILL_REGEX_PATTERNS.items():
            matches = list(re.finditer(pattern, text, re.IGNORECASE))
            if matches:
                # Determine level based on context around match
                level = cls._determine_skill_level(text_lower, matches[0].start())
                detected_skills[skill_token] = level

        # Check any remaining technical skills from features
        for skill in TECHNICAL_SKILLS:
            if skill not in detected_skills:
                # Clean literal search
                skill_clean = skill.replace("_", " ")
                pattern = r"\b" + re.escape(skill_clean) + r"\b"
                matches = list(re.finditer(pattern, text_lower))
                if matches:
                    level = cls._determine_skill_level(text_lower, matches[0].start())
                    detected_skills[skill] = level

        # Check aliases
        for alias, canon in SKILL_ALIASES.items():
            if canon not in detected_skills:
                pattern = r"\b" + re.escape(alias) + r"\b"
                if re.search(pattern, text_lower):
                    detected_skills[canon] = "intermediate"

        # Format output list
        result = []
        for skill_name, level in sorted(detected_skills.items()):
            result.append(
                ExtractedSkill(
                    name=skill_name,
                    level=level,
                    source="RESUME_PARSED",
                )
            )
        return result

    @classmethod
    def _determine_skill_level(cls, text_lower: str, match_pos: int) -> str:
        """Examines the 80-character surrounding window for proficiency qualifiers."""
        start = max(0, match_pos - 40)
        end = min(len(text_lower), match_pos + 60)
        window = text_lower[start:end]

        for word in ADVANCED_KEYWORDS:
            if word in window:
                return "advanced"
        for word in BEGINNER_KEYWORDS:
            if word in window:
                return "beginner"
        return "intermediate"

    @classmethod
    def _extract_domains(cls, text_lower: str) -> List[str]:
        """Identifies matched career interest domains based on vocabulary frequency."""
        domains_found: Set[str] = set()

        # Check canonical interest domain terms
        for domain in INTEREST_DOMAINS:
            domain_clean = domain.replace("_", " ")
            if domain_clean in text_lower:
                domains_found.add(domain)

        # Check interest aliases
        for alias, canon in INTEREST_ALIASES.items():
            if alias in text_lower:
                domains_found.add(canon)

        # Check catalog category matches
        for stack_code, meta in TECH_STACK_CATALOG.items():
            category = meta.get("category", "").lower()
            if category in text_lower:
                for d in INTEREST_DOMAINS:
                    if d.replace("_", " ") in category:
                        domains_found.add(d)

        return sorted(list(domains_found))

    @classmethod
    def _extract_projects(cls, text: str) -> Tuple[List[str], int]:
        """Extracts project section items and estimates project count."""
        lines = text.split("\n")
        in_project_section = False
        project_titles: List[str] = []

        for line in lines:
            trimmed = line.strip()
            if not trimmed:
                continue

            # Check if this line is a project section heading
            is_heading = any(re.match(p, trimmed) for p in PROJECT_PATTERNS)
            if is_heading:
                in_project_section = True
                continue

            # If inside project section, check for bullets or titles
            if in_project_section:
                # Stop if another major heading starts
                if re.match(r"(?i)^(education|skills|certifications|experience|achievements|contact)", trimmed):
                    in_project_section = False
                    continue

                if re.match(r"^[\•\-\*\d\.]+\s+([A-Za-z0-9].+)", trimmed) and len(trimmed) > 10:
                    project_titles.append(trimmed[:80])
                elif len(trimmed) > 15 and trimmed.endswith(":") or re.search(r"\b(using|built with|developed)\b", trimmed, re.I):
                    project_titles.append(trimmed[:80])

        count = len(project_titles)
        if count == 0:
            # Fallback scan for mentions of projects across the document
            mentions = len(re.findall(r"(?i)\bproject\b", text))
            count = min(5, max(1, mentions // 2)) if mentions > 0 else 1

        return project_titles[:6], min(10, count)

    @classmethod
    def _count_certifications(cls, text: str) -> int:
        """Counts explicit certification entries in the resume text."""
        total_certs = 0
        lines = text.split("\n")
        in_cert_section = False

        for line in lines:
            trimmed = line.strip()
            if not trimmed:
                continue

            if re.match(r"(?i)^certifications?(\s*&.*)?$", trimmed):
                in_cert_section = True
                continue

            if in_cert_section:
                if re.match(r"(?i)^(education|skills|projects|experience|summary)", trimmed):
                    in_cert_section = False
                    continue
                if len(trimmed) > 5:
                    total_certs += 1

        if total_certs == 0:
            for pattern in CERT_KEYWORDS:
                matches = re.findall(pattern, text)
                total_certs += len(matches)

        return min(5, total_certs)

    @classmethod
    def _estimate_experience_level(cls, text_lower: str) -> str:
        """Determines experience level based on seniority cues."""
        for pattern in SENIOR_PATTERNS:
            if re.search(pattern, text_lower):
                return "advanced"

        for pattern in BEGINNER_PATTERNS:
            if re.search(pattern, text_lower):
                return "beginner"

        return "intermediate"
