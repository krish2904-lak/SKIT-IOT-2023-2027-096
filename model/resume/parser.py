"""
Document and text ingestion engine for student resumes.
Extracts clean plain text from raw strings, plain text files (.txt),
PDF files (.pdf), and Microsoft Word files (.docx) with strict file size
enforcement, empty/scanned document detection, and memory isolation.

Privacy & Safety:
All document buffers and extracted text are processed strictly in-memory.
Resume text is never persisted to disk, never logged to stdout/stderr or files,
and contains zero disk leakage.
"""

import io
from pathlib import Path
from typing import Union, Optional
from pypdf import PdfReader
from docx import Document

DEFAULT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
SUPPORTED_EXTENSIONS = {".txt", ".pdf", ".docx"}


def extract_text_from_file(
    file_bytes: bytes,
    filename: str,
    max_size_bytes: int = DEFAULT_MAX_FILE_SIZE_BYTES,
) -> str:
    """
    Extracts raw text content from uploaded file bytes (.txt, .pdf, .docx).
    Validates file size boundary (5 MB) and file format extensions.
    """
    if not file_bytes or len(file_bytes) == 0:
        raise ValueError("Uploaded file is empty (0 bytes).")

    if len(file_bytes) > max_size_bytes:
        max_mb = max_size_bytes // (1024 * 1024)
        actual_mb = round(len(file_bytes) / (1024 * 1024), 2)
        raise ValueError(
            f"File size ({actual_mb} MB) exceeds maximum allowed limit of {max_mb} MB."
        )

    ext = Path(filename).suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file format '{ext}'. Only plain text (.txt), PDF (.pdf), and Word (.docx) files are supported."
        )

    if ext == ".txt":
        return _extract_from_txt(file_bytes)
    elif ext == ".pdf":
        return _extract_from_pdf(file_bytes)
    elif ext == ".docx":
        return _extract_from_docx(file_bytes)
    else:
        raise ValueError(f"Unhandled file format '{ext}'.")


def extract_text_from_input(
    input_data: Union[str, bytes],
    filename: Optional[str] = None,
    max_size_bytes: int = DEFAULT_MAX_FILE_SIZE_BYTES,
) -> str:
    """
    Unified entry point accepting either plain string text or file bytes.
    """
    if isinstance(input_data, str):
        text = input_data.strip()
        if not text or len(text) < 5:
            raise ValueError("Input resume text is empty or too short.")
        if len(text.encode("utf-8")) > max_size_bytes:
            raise ValueError("Input resume text exceeds maximum allowed size limit of 5 MB.")
        return text

    if isinstance(input_data, (bytes, bytearray)):
        fn = filename or "resume.txt"
        return extract_text_from_file(bytes(input_data), fn, max_size_bytes=max_size_bytes)

    raise ValueError(f"Unsupported input data type: {type(input_data).__name__}")


def _extract_from_txt(file_bytes: bytes) -> str:
    """Decodes plain text bytes into a cleaned string."""
    try:
        text = file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text = file_bytes.decode("latin-1")
        except Exception as e:
            raise ValueError(f"Failed to decode text file encoding: {str(e)}")

    cleaned = text.strip()
    if not cleaned or len(cleaned) < 5:
        raise ValueError("Plain text resume contains no extractable characters.")
    return cleaned


def _extract_from_pdf(file_bytes: bytes) -> str:
    """Extracts text pages from PDF bytes using pypdf."""
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
    except Exception as e:
        raise ValueError(f"Failed to parse PDF document structure: {str(e)}")

    if len(reader.pages) == 0:
        raise ValueError("PDF document contains no pages.")

    extracted_pages = []
    for idx, page in enumerate(reader.pages):
        try:
            page_text = page.extract_text()
            if page_text:
                extracted_pages.append(page_text)
        except Exception:
            continue

    full_text = "\n".join(extracted_pages).strip()

    if not full_text or len(full_text) < 10:
        raise ValueError(
            "No extractable text found in PDF. The document may be empty, password-protected, "
            "or a scanned image-only PDF without OCR text layers."
        )

    return full_text


def _extract_from_docx(file_bytes: bytes) -> str:
    """Extracts text paragraphs and tables from DOCX bytes using python-docx."""
    try:
        doc = Document(io.BytesIO(file_bytes))
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX document structure: {str(e)}")

    text_parts = []
    for paragraph in doc.paragraphs:
        p_text = paragraph.text.strip()
        if p_text:
            text_parts.append(p_text)

    for table in doc.tables:
        for row in table.rows:
            row_texts = [cell.text.strip() for cell in row.cells if cell.text.strip()]
            if row_texts:
                text_parts.append(" | ".join(row_texts))

    full_text = "\n".join(text_parts).strip()

    if not full_text or len(full_text) < 10:
        raise ValueError("No extractable text found in DOCX document.")

    return full_text
