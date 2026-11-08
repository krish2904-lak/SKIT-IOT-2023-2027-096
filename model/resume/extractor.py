"""
Resume Extractor Architecture: Extractor Interface, RuleBasedExtractor, and LLMExtractor.
Standardized extraction of technical skills, projects, certifications, education/CGPA,
and career domains from unstructured text.

Privacy Notice:
- RuleBasedExtractor processes all text strictly locally and offline in-memory.
- LLMExtractor (when activated by an API key like GEMINI_API_KEY) transmits document text
  to an external LLM endpoint for inference. On any failure or if the key is unset,
  it falls back seamlessly to RuleBasedExtractor.
"""

from abc import ABC, abstractmethod
import json
import os
from pathlib import Path
import re
from typing import Dict, List, Set, Any, Optional, Tuple
import httpx
from pydantic import ValidationError

from .schemas import ExtractedSkill, ResumeExtractionResult


# Specific regex patterns for skills requiring careful word boundary delimiters
SKILL_REGEX_PATTERNS: Dict[str, str] = {
    "c": r"\b[Cc]\b(?![+#])",
    "cpp": r"\b(cpp|c\+\+|c/c\+\+)(?!\+)",
    "html_css": r"\b(html|css|html5|css3|html/css|tailwind|bootstrap)\b",
    "git": r"\b(git|github|gitlab)\b",
    "aws": r"\b(aws|amazon web services|ec2|s3|lambda)\b",
    "scikit_learn": r"\b(scikit-learn|sklearn|scikit learn)\b",
    "nodejs": r"\b(node\.?js|node)\b",
    "react": r"\b(react\.?js|react|react-native)\b",
    "express": r"\b(express\.?js|express)\b",
    "fastapi": r"\b(fastapi)\b",
    "django": r"\b(django)\b",
    "flask": r"\b(flask)\b",
    "pytorch": r"\b(pytorch|torch)\b",
    "tensorflow": r"\b(tensorflow|tf|keras)\b",
    "mongodb": r"\b(mongodb|mongo)\b",
    "postgresql": r"\b(postgresql|postgres|psql)\b",
    "mysql": r"\b(mysql|mariadb)\b",
    "influxdb": r"\b(influxdb|influx)\b",
    "docker": r"\b(docker|containerization)\b",
    "kubernetes": r"\b(kubernetes|k8s)\b",
    "linux": r"\b(linux|ubuntu|bash|shell|unix)\b",
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

ADVANCED_KEYWORDS = {"advanced", "expert", "senior", "lead", "proficient", "master", "extensive", "3+ years", "4+ years", "5+ years"}
BEGINNER_KEYWORDS = {"beginner", "basic", "familiar", "novice", "introductory", "learning", "elementary", "fundamental"}

PROJECT_HEADERS = [
    r"(?i)\bacademic projects?\b",
    r"(?i)\bpersonal projects?\b",
    r"(?i)\bkey projects?\b",
    r"(?i)\bfeatured projects?\b",
    r"(?i)\bprojects?\b",
]

CERT_PATTERNS = [
    r"(?i)\b(aws certified|gcp certified|azure certified)\b[^\n]*",
    r"(?i)\b(coursera|udemy|nptel|hackerrank|leetcode)\b[^\n]*",
    r"(?i)\bcertif(?:icate|ication|ied)\b[^\n]*",
]

CGPA_PATTERNS = [
    r"(?i)\b(?:cgpa|gpa)\s*[:=\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:/\s*(?:10(?:\.0)?|4(?:\.0)?))?",
    r"(?i)\b([0-9]\.[0-9]{1,2})\s*/\s*10(?:\.0)?\b",
    r"(?i)\b([0-9]{2}(?:\.[0-9]{1,2})?)\s*%\s*(?:aggregate|marks)?\b",
]


class ResumeExtractor(ABC):
    """Abstract interface defining contract for student resume extraction engines."""

    @abstractmethod
    def extract(self, text: str) -> ResumeExtractionResult:
        """Parses extracted resume text into structured ResumeExtractionResult."""
        pass


class RuleBasedExtractor(ResumeExtractor):
    """
    Default, offline, deterministic extractor.
    Uses regex patterns and skills_taxonomy.json to identify skills, projects,
    certifications, education/CGPA hints, and career domain interests.
    """

    _taxonomy_cache: Optional[Dict[str, Any]] = None

    def __init__(self, taxonomy_path: Optional[Path] = None):
        self.taxonomy_path = taxonomy_path or (Path(__file__).parent / "skills_taxonomy.json")
        self.taxonomy = self._load_taxonomy()

    def _load_taxonomy(self) -> Dict[str, Any]:
        if RuleBasedExtractor._taxonomy_cache is None:
            if self.taxonomy_path.exists():
                with open(self.taxonomy_path, "r", encoding="utf-8") as f:
                    RuleBasedExtractor._taxonomy_cache = json.load(f)
            else:
                RuleBasedExtractor._taxonomy_cache = {"skills": [], "domains": []}
        return RuleBasedExtractor._taxonomy_cache

    def extract(self, text: str) -> ResumeExtractionResult:
        text_lower = text.lower()

        # 1. Extract Skills
        skills = self._extract_skills(text, text_lower)

        # 2. Extract Domains
        domains = self._extract_domains(text_lower)

        # 3. Extract Projects
        projects, projects_count = self._extract_projects(text)

        # 4. Extract Certifications
        certifications, certs_count = self._extract_certifications(text)

        # 5. Extract CGPA Hint
        cgpa_hint = self._extract_cgpa(text)

        # 6. Experience Level
        experience_level = self._classify_experience_level(text_lower, projects_count)

        return ResumeExtractionResult(
            skills=skills,
            domains=domains,
            projects=projects,
            projects_count=projects_count,
            certifications=certifications,
            certifications_count=certs_count,
            cgpa_hint=cgpa_hint,
            experience_level=experience_level,
            extraction_method="rule_based",
            raw_text_length=len(text),
        )

    def _extract_skills(self, text: str, text_lower: str) -> List[ExtractedSkill]:
        extracted_skills: List[ExtractedSkill] = []
        found_skills: Set[str] = set()

        # Check regex patterns first
        for canonical, pattern in SKILL_REGEX_PATTERNS.items():
            match = re.search(pattern, text_lower)
            if match:
                found_skills.add(canonical)
                level = self._detect_skill_proficiency(text_lower, match.start(), match.end())
                extracted_skills.append(
                    ExtractedSkill(
                        name=canonical,
                        level=level,
                        source="RESUME_RULE",
                        confidence=0.90,
                    )
                )

        # Check taxonomy skills & aliases
        for skill_meta in self.taxonomy.get("skills", []):
            canon = skill_meta.get("canonical")
            if not canon or canon in found_skills:
                continue

            for alias in skill_meta.get("aliases", []):
                alias_lower = alias.lower()
                pattern = rf"\b{re.escape(alias_lower)}\b"
                match = re.search(pattern, text_lower)
                if match:
                    found_skills.add(canon)
                    level = self._detect_skill_proficiency(text_lower, match.start(), match.end())
                    extracted_skills.append(
                        ExtractedSkill(
                            name=canon,
                            level=level,
                            source="RESUME_RULE",
                            confidence=0.85,
                        )
                    )
                    break

        return extracted_skills

    def _detect_skill_proficiency(self, text_lower: str, start: int, end: int) -> str:
        window_start = max(0, start - 100)
        window_end = min(len(text_lower), end + 100)
        context = text_lower[window_start:window_end]

        for kw in ADVANCED_KEYWORDS:
            if kw in context:
                return "advanced"
        for kw in BEGINNER_KEYWORDS:
            if kw in context:
                return "beginner"
        return "intermediate"

    def _extract_domains(self, text_lower: str) -> List[str]:
        found_domains: List[str] = []
        for domain_meta in self.taxonomy.get("domains", []):
            canon = domain_meta.get("canonical")
            for alias in domain_meta.get("aliases", []):
                alias_lower = alias.lower()
                pattern = rf"\b{re.escape(alias_lower)}\b"
                if re.search(pattern, text_lower):
                    if canon and canon not in found_domains:
                        found_domains.append(canon)
                    break
        return found_domains

    def _extract_projects(self, text: str) -> Tuple[List[str], int]:
        projects: List[str] = []
        lines = text.split("\n")
        in_project_section = False
        project_count = 0

        for line in lines:
            line_s = line.strip()
            if not line_s:
                continue

            # Detect section header
            for p_hdr in PROJECT_HEADERS:
                if re.search(p_hdr, line_s):
                    in_project_section = True
                    break

            if in_project_section:
                # Detect end of project section
                if re.match(r"(?i)^(education|certifications?|skills?|experience|work history)\b", line_s):
                    in_project_section = False
                    continue

                if line_s.startswith(("-", "*", "â€¢", "1.", "2.", "3.", "4.", "5.", ">")):
                    project_count += 1
                    if len(projects) < 5:
                        clean_proj = re.sub(r"^[-*â€¢\d.>]+\s*", "", line_s)
                        if len(clean_proj) > 10:
                            projects.append(clean_proj[:120])

        if project_count == 0:
            # Fallback regex search for project mentions
            matches = re.findall(r"(?i)(?:project|system|application|platform|dashboard)\s*:\s*([^\n]+)", text)
            for m in matches:
                clean_m = m.strip()
                if len(clean_m) > 10:
                    projects.append(clean_m[:120])
            project_count = max(len(projects), 1 if re.search(r"(?i)\bprojects?\b", text) else 0)

        return projects, min(10, max(project_count, len(projects)))

    def _extract_certifications(self, text: str) -> Tuple[List[str], int]:
        certs: List[str] = []
        for pat in CERT_PATTERNS:
            matches = re.findall(pat, text)
            for m in matches:
                clean_c = m.strip()
                if len(clean_c) > 5 and clean_c not in certs:
                    certs.append(clean_c[:100])
        return certs, min(5, len(certs))

    def _extract_cgpa(self, text: str) -> Optional[float]:
        for pat in CGPA_PATTERNS:
            match = re.search(pat, text)
            if match:
                val_str = match.group(1)
                try:
                    val = float(val_str)
                    if 0.0 <= val <= 10.0:
                        return round(val, 2)
                    elif 10.0 < val <= 100.0:
                        # Percentage scaled to 10
                        return round(val / 10.0, 2)
                except ValueError:
                    continue
        return None

    def _classify_experience_level(self, text_lower: str, projects_count: int) -> str:
        if re.search(r"\b(senior|lead|4\+\s*years|5\+\s*years)\b", text_lower):
            return "advanced"
        if re.search(r"\b(intern|fresher|undergraduate|student|entry\s*level)\b", text_lower) and projects_count <= 2:
            return "beginner"
        return "intermediate"


class LLMExtractor(ResumeExtractor):
    """
    Optional LLM-based resume extractor (active when GEMINI_API_KEY / LLM_API_KEY is configured).
    Sends resume text to an external LLM endpoint to obtain structured JSON extraction.
    Validates output strictly with Pydantic and falls back to RuleBasedExtractor on any failure.
    """

    SYSTEM_PROMPT = """
You are an expert technical resume parser for computer science students.
Extract the technical competencies, projects, certifications, education/CGPA, and domains.
Return a STRICT, RAW JSON object matching this schema:
{
  "skills": [
    {"name": "canonical_skill_name", "level": "beginner|intermediate|advanced"}
  ],
  "projects": ["Project title or brief description"],
  "projects_count": 2,
  "certifications": ["Certification title"],
  "certifications_count": 1,
  "cgpa_hint": 8.5,
  "experience_level": "beginner|intermediate|advanced",
  "domains": ["web_development", "ai_ml", "iot_embedded", "cloud_devops", "mobile_dev", "data_analytics", "cybersecurity"]
}
Rules:
1. Normalize skills to canonical names (python, react, docker, esp32, postgresql, etc.).
2. Categorize levels strictly as beginner, intermediate, or advanced.
3. If CGPA is present, scale to 0.0 - 10.0 range.
4. Output ONLY the JSON object. No explanation, markdown codeblocks, or extra text.
"""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model_name: Optional[str] = None,
        fallback_extractor: Optional[ResumeExtractor] = None,
        http_client: Optional[httpx.Client] = None,
    ):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY") or ""
        self.base_url = base_url or os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
        self.model_name = model_name or os.getenv("LLM_MODEL", "gpt-4o-mini")
        self.fallback = fallback_extractor or RuleBasedExtractor()
        self.http_client = http_client

    @property
    def is_available(self) -> bool:
        """Indicates whether an external API key is configured."""
        return bool(self.api_key.strip())

    def extract(self, text: str) -> ResumeExtractionResult:
        if not self.is_available:
            return self.fallback.extract(text)

        # Attempt LLM extraction with automatic fallback
        try:
            return self._call_llm_with_retry(text)
        except Exception:
            fallback_res = self.fallback.extract(text)
            fallback_res.extraction_method = "llm_fallback"
            return fallback_res

    def _call_llm_with_retry(self, text: str, max_retries: int = 1) -> ResumeExtractionResult:
        endpoint = f"{self.base_url.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": f"Resume Text:\n{text[:6000]}"},
            ],
            "temperature": 0.0,
            "response_format": {"type": "json_object"},
        }

        last_error = None
        for attempt in range(max_retries + 1):
            try:
                if self.http_client:
                    resp = self.http_client.post(endpoint, headers=headers, json=payload, timeout=12.0)
                else:
                    with httpx.Client(timeout=12.0) as client:
                        resp = client.post(endpoint, headers=headers, json=payload)

                if resp.status_code != 200:
                    raise ValueError(f"LLM API returned status code {resp.status_code}: {resp.text}")

                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                clean_json = self._extract_json_string(content)
                parsed = json.loads(clean_json)

                # Validate using Pydantic
                raw_skills = parsed.get("skills", [])
                validated_skills = []
                for s in raw_skills:
                    if isinstance(s, dict) and "name" in s:
                        validated_skills.append(
                            ExtractedSkill(
                                name=str(s["name"]).strip().lower(),
                                level=str(s.get("level", "intermediate")).strip().lower(),
                                source="RESUME_LLM",
                                confidence=0.92,
                            )
                        )

                return ResumeExtractionResult(
                    skills=validated_skills,
                    domains=parsed.get("domains", []),
                    projects=parsed.get("projects", []),
                    projects_count=int(parsed.get("projects_count", len(parsed.get("projects", [])))),
                    certifications=parsed.get("certifications", []),
                    certifications_count=int(parsed.get("certifications_count", len(parsed.get("certifications", [])))),
                    cgpa_hint=float(parsed["cgpa_hint"]) if parsed.get("cgpa_hint") is not None else None,
                    experience_level=str(parsed.get("experience_level", "intermediate")).strip().lower(),
                    extraction_method="llm_gemini" if "gemini" in self.model_name.lower() or os.getenv("GEMINI_API_KEY") else "llm_external",
                    raw_text_length=len(text),
                )
            except Exception as err:
                last_error = err

        raise ValueError(f"LLM extraction failed after {max_retries} retries: {str(last_error)}")

    def _extract_json_string(self, text: str) -> str:
        s = text.strip()
        if s.startswith("```"):
            s = re.sub(r"^```(?:json)?\s*", "", s)
            s = re.sub(r"\s*```$", "", s)
        return s.strip()
