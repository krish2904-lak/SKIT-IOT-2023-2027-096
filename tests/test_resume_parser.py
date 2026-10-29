"""
Unit tests for resume document text extraction (PDF & DOCX).
Uses in-test generated fixtures to verify text extraction, file size limits,
empty/scanned file rejection, and unsupported format detection.
"""

import io
import pytest
from docx import Document
from reportlab.pdfgen import canvas

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


def test_pdf_extraction_valid_text():
    """Valid PDF should have its text extracted accurately."""
    sample_text = (
        "Nishant Kumawat\n"
        "Skills: Python, React, FastAPI, Docker, PostgreSQL\n"
        "Experience: 2 years building full-stack cloud applications\n"
        "Projects: IoT Smart Gateway with ESP32 and MQTT"
    )
    pdf_bytes = _generate_test_pdf(sample_text)
    extracted = extract_text_from_file(pdf_bytes, "resume.pdf")

    assert "Nishant Kumawat" in extracted
    assert "Python" in extracted
    assert "FastAPI" in extracted
    assert "ESP32" in extracted


def test_docx_extraction_valid_text():
    """Valid DOCX should have its paragraphs extracted accurately."""
    sample_text = (
        "Lakshya Jain\n"
        "Technical Competencies: Node.js, Express, MongoDB, Kubernetes, AWS\n"
        "Academic Background: B.Tech CSE (IoT), CGPA: 8.8\n"
        "Certifications: AWS Certified Cloud Practitioner"
    )
    docx_bytes = _generate_test_docx(sample_text)
    extracted = extract_text_from_file(docx_bytes, "lakshya_resume.docx")

    assert "Lakshya Jain" in extracted
    assert "Express" in extracted
    assert "MongoDB" in extracted
    assert "AWS Certified" in extracted


def test_empty_file_bytes_rejected():
    """Zero-byte files must raise a ValueError."""
    with pytest.raises(ValueError, match="empty"):
        extract_text_from_file(b"", "empty.pdf")


def test_file_size_limit_enforced():
    """Files exceeding max_size_bytes must raise a clear ValueError."""
    # Create fake oversized buffer with small limit
    fake_bytes = b"X" * (1024 * 1024 + 10)  # ~1.01 MB
    with pytest.raises(ValueError, match="exceeds maximum allowed limit"):
        extract_text_from_file(fake_bytes, "oversized.pdf", max_size_bytes=1024 * 1024)


def test_unsupported_file_extension_rejected():
    """Non-PDF and non-DOCX formats must raise an unsupported format error."""
    with pytest.raises(ValueError, match="Unsupported file format"):
        extract_text_from_file(b"some content", "resume.txt")

    with pytest.raises(ValueError, match="Unsupported file format"):
        extract_text_from_file(b"some content", "resume.png")


def test_scanned_or_empty_pdf_detection():
    """A PDF with zero extractable text (e.g. blank page canvas) must raise an informative error."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    # Empty page without any text drawn
    c.showPage()
    c.save()
    blank_pdf = buf.getvalue()

    with pytest.raises(ValueError, match="No extractable text found in PDF"):
        extract_text_from_file(blank_pdf, "scanned_image.pdf")


def test_empty_docx_detection():
    """A DOCX with no paragraphs or text must raise an informative error."""
    doc = Document()
    buf = io.BytesIO()
    doc.save(buf)
    blank_docx = buf.getvalue()

    with pytest.raises(ValueError, match="No extractable text found in DOCX"):
        extract_text_from_file(blank_docx, "blank.docx")
