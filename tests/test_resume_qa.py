"""
Automated QA & Validation Suite for Resume Ingestion, Buffer Isolation & Safety Invariants
Author: Saloni Jain (Data & Testing Lead)
Project: AI-Based Tech-Stack Recommendation with ERP Integration (SKIT-IOT-2023-2027-096)
Sprint: Sprint 3 / Week 8 Deliverable
"""

import io
import os
from pathlib import Path
from typing import Dict, Any, List

try:
    import pytest
except ImportError:
    pytest = None

from reportlab.pdfgen import canvas
from docx import Document

from app.resume.parser import (
    extract_text_from_file,
    DEFAULT_MAX_FILE_SIZE_BYTES,
)


def _generate_test_pdf(text: str) -> bytes:
    """Generates an in-memory valid PDF containing the given text."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    y = 750
    for line in text.split("\n"):
        c.drawString(50, y, line)
        y -= 18
    c.showPage()
    c.save()
    return buf.getvalue()


def _generate_test_docx(text: str) -> bytes:
    """Generates an in-memory valid DOCX containing the given text."""
    doc = Document()
    doc.add_heading("Student Resume Profile", level=1)
    for line in text.split("\n"):
        if line.strip():
            doc.add_paragraph(line.strip())
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


class TestResumeQA:
    """
    Quality assurance and invariant verification for resume document ingestion,
    in-memory buffer isolation, format validation, and safety invariants.
    """

    def setUp(self):
        self.sample_text = (
            "Saloni Jain\n"
            "Skills: Python, Scikit-learn, SQL, Docker, FastAPI\n"
            "Domain: Data Science and Analytics, Machine Learning\n"
            "Projects: Tech-Stack Recommendation Engine with Model QA Validation"
        )

    def test_buffer_memory_isolation_and_zero_disk_persistence(self):
        """Validates that document parsing processes purely in-memory with zero disk leakage."""
        pdf_bytes = _generate_test_pdf(self.sample_text)
        docx_bytes = _generate_test_docx(self.sample_text)

        # Baseline snapshot of directory contents
        cwd_files_before = set(os.listdir("."))

        extracted_pdf = extract_text_from_file(pdf_bytes, "test_resume.pdf")
        extracted_docx = extract_text_from_file(docx_bytes, "test_resume.docx")

        cwd_files_after = set(os.listdir("."))

        # Assert zero temporary files created on disk
        assert cwd_files_before == cwd_files_after, "Temporary files were leaked to disk during parsing!"

        # Assert extracted text content
        assert "Saloni Jain" in extracted_pdf
        assert "Python" in extracted_pdf
        assert "Saloni Jain" in extracted_docx
        assert "Scikit-learn" in extracted_docx

    def test_file_format_boundary_and_extension_validation(self):
        """Verifies rejection of unsupported formats and case-insensitivity of valid formats."""
        pdf_bytes = _generate_test_pdf(self.sample_text)
        docx_bytes = _generate_test_docx(self.sample_text)

        # Case-insensitivity verification
        assert len(extract_text_from_file(pdf_bytes, "RESUME.PDF")) > 10
        assert len(extract_text_from_file(docx_bytes, "profile.DocX")) > 10

        # Unsupported extensions must raise ValueError
        unsupported_files = [
            ("resume.txt", b"plain text resume content"),
            ("resume.json", b'{"skills": ["python"]}'),
            ("resume.exe", b"\x4d\x5a\x90\x00"),
            ("resume.png", b"\x89PNG\r\n\x1a\n"),
            ("resume", b"no extension data"),
        ]

        for filename, payload in unsupported_files:
            try:
                extract_text_from_file(payload, filename)
                assert False, f"Expected ValueError for unsupported format '{filename}', but succeeded."
            except ValueError as e:
                assert "Unsupported file format" in str(e) or "empty" in str(e)

    def test_corrupted_and_empty_payload_rejection(self):
        """Validates that zero-byte or malformed byte streams raise descriptive ValueErrors."""
        # Zero-byte upload
        try:
            extract_text_from_file(b"", "empty.pdf")
            assert False, "Expected ValueError for empty PDF byte stream"
        except ValueError as e:
            assert "Uploaded file is empty (0 bytes)" in str(e)

        try:
            extract_text_from_file(b"", "empty.docx")
            assert False, "Expected ValueError for empty DOCX byte stream"
        except ValueError as e:
            assert "Uploaded file is empty (0 bytes)" in str(e)

        # Malformed / corrupted byte stream
        corrupted_bytes = b"This is not a real PDF file header."
        try:
            extract_text_from_file(corrupted_bytes, "corrupted.pdf")
            assert False, "Expected ValueError for corrupted PDF structure"
        except ValueError as e:
            assert "Failed to parse PDF document structure" in str(e)

    def test_file_size_boundary_enforcement(self):
        """Verifies that uploads exceeding the 5MB maximum boundary are safely rejected."""
        mock_limit = 1024  # 1 KB boundary for fast unit testing
        oversized_bytes = b"A" * (mock_limit + 100)

        try:
            extract_text_from_file(oversized_bytes, "large_file.pdf", max_size_bytes=mock_limit)
            assert False, "Expected ValueError for oversized file upload"
        except ValueError as e:
            assert "exceeds maximum allowed limit" in str(e)

    def test_pii_and_trace_safety_invariants(self):
        """Verifies error messages never echo unhandled raw file buffers in tracebacks."""
        try:
            extract_text_from_file(b"\x00\x01\x02\x03", "test.pdf")
        except ValueError as e:
            error_msg = str(e)
            # Ensure raw bytes/escaped binary is not exposed directly in user-facing error message
            assert "\\x00\\x01" not in error_msg
            assert "Failed to parse PDF document structure" in error_msg
