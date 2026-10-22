"""
Provider-agnostic LLM client for structured resume skill and metadata extraction.
Reads API credentials and configuration from environment variables (never hardcoded),
enforces strict JSON responses with Pydantic validation and automatic single-retry
resilience, and gracefully falls back to deterministic extraction if LLM is unavailable or fails.
"""

import json
import os
import re
from typing import Dict, Any, Optional
import httpx
from pydantic import ValidationError

from .schemas import ExtractedSkill, ResumeExtractionResult
from .fallback_extractor import FallbackResumeExtractor


SYSTEM_EXTRACTION_PROMPT = """
You are an expert technical resume parser and engineering skill extraction engine.
Analyze the provided student resume text and extract the technical competencies, projects,
certifications, and career domains.

You MUST reply with a STRICT, RAW JSON object matching this exact structure:
{
  "skills": [
    {"name": "canonical_skill_name", "level": "beginner|intermediate|advanced"}
  ],
  "projects": ["Brief description or title of technical project"],
  "projects_count": 2,
  "certifications_count": 1,
  "experience_level": "beginner|intermediate|advanced",
  "domains": ["web_development", "ai_ml", "iot_embedded", "cloud_devops", "mobile_dev", "data_analytics", "cybersecurity"]
}

Rules:
1. Normalize skill names to lowercase canonical terms (e.g., 'python', 'react', 'docker', 'esp32', 'postgresql').
2. Classify skill proficiency into 'beginner', 'intermediate', or 'advanced' based on usage context.
3. Classify experience_level as 'beginner', 'intermediate', or 'advanced'.
4. Include only technical domain interests from: web_development, ai_ml, iot_embedded, cloud_devops, mobile_dev, data_analytics, cybersecurity.
5. Do NOT include any markdown code fencing, conversational text, or explanation outside the JSON object.
"""


class LLMResumeExtractor:
    """
    Provider-agnostic LLM extraction client.
    Supports OpenAI-compatible chat completion APIs and custom provider endpoints.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        base_url: Optional[str] = None,
        http_client: Optional[httpx.Client] = None,
    ):
        self.api_key = api_key or os.getenv("LLM_API_KEY", "")
        self.model_name = model_name or os.getenv("LLM_MODEL_NAME", os.getenv("LLM_MODEL", "gpt-4o-mini"))
        self.base_url = (base_url or os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")).rstrip("/")
        self._http_client = http_client

    @property
    def is_available(self) -> bool:
        """Returns True if an API key is configured."""
        return bool(self.api_key and self.api_key.strip())

    def _get_http_client(self) -> httpx.Client:
        if self._http_client is not None:
            return self._http_client
        return httpx.Client(timeout=20.0)

    def extract(self, resume_text: str) -> ResumeExtractionResult:
        """
        Extracts structured skill profile from resume text.
        Attempts LLM extraction if API key is present; retries once on malformed JSON;
        gracefully falls back to FallbackResumeExtractor on failure or missing key.
        """
        if not self.is_available:
            return FallbackResumeExtractor.extract(resume_text)

        try:
            return self._call_llm_with_retry(resume_text)
        except Exception as e:
            # PII Safety: Log error type without logging the raw resume text
            print(f"[LLMResumeExtractor] Extraction via LLM failed ({type(e).__name__}). Falling back to deterministic engine.")
            return FallbackResumeExtractor.extract(resume_text)

    def _call_llm_with_retry(self, resume_text: str) -> ResumeExtractionResult:
        """Executes LLM API call with a single retry on bad JSON / Pydantic validation failure."""
        first_response = self._invoke_completion(
            messages=[
                {"role": "system", "content": SYSTEM_EXTRACTION_PROMPT},
                {"role": "user", "content": f"Parse the following engineering student resume:\n\n{resume_text}"},
            ]
        )

        try:
            parsed = self._parse_and_validate(first_response)
            parsed.extraction_method = "llm"
            return parsed
        except (json.JSONDecodeError, ValidationError) as err:
            # Single retry with explicit correction instruction
            retry_prompt = (
                f"Your previous response failed validation with error: {str(err)}.\n"
                f"Return ONLY valid JSON matching the exact schema without any markdown formatting.\n"
                f"Resume text:\n\n{resume_text}"
            )
            second_response = self._invoke_completion(
                messages=[
                    {"role": "system", "content": SYSTEM_EXTRACTION_PROMPT},
                    {"role": "user", "content": retry_prompt},
                ]
            )
            parsed = self._parse_and_validate(second_response)
            parsed.extraction_method = "llm"
            return parsed

    def _invoke_completion(self, messages: list) -> str:
        """Performs HTTP POST request to OpenAI-compatible chat completion endpoint."""
        endpoint = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": 0.1,
            "response_format": {"type": "json_object"} if "gpt" in self.model_name.lower() else None,
        }
        # Filter out None values
        payload = {k: v for k, v in payload.items() if v is not None}

        client = self._get_http_client()
        response = client.post(endpoint, json=payload, headers=headers)
        response.raise_for_status()

        data = response.json()
        choices = data.get("choices", [])
        if not choices:
            raise ValueError("LLM completion response contained empty choices.")

        content = choices[0].get("message", {}).get("content", "")
        return content

    def _parse_and_validate(self, raw_text: str) -> ResumeExtractionResult:
        """Extracts JSON block and validates via Pydantic schema."""
        cleaned = raw_text.strip()
        # Strip markdown fences if present
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\n?", "", cleaned, flags=re.MULTILINE)
            cleaned = re.sub(r"\n?```$", "", cleaned, flags=re.MULTILINE).strip()

        data = json.loads(cleaned)

        # Standardize skills list if raw strings were returned instead of dicts
        raw_skills = data.get("skills", [])
        standardized_skills = []
        for s in raw_skills:
            if isinstance(s, dict):
                standardized_skills.append(
                    ExtractedSkill(
                        name=str(s.get("name", "")).strip().lower(),
                        level=str(s.get("level", "intermediate")).strip().lower(),
                        source="RESUME_PARSED",
                    )
                )
            elif isinstance(s, str):
                standardized_skills.append(
                    ExtractedSkill(
                        name=s.strip().lower(),
                        level="intermediate",
                        source="RESUME_PARSED",
                    )
                )

        data["skills"] = standardized_skills
        data["extraction_method"] = "llm"

        return ResumeExtractionResult.model_validate(data)
