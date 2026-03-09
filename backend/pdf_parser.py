"""
PDF resume parser using pdfplumber.
Extracts text content from uploaded PDF resumes.
"""

import pdfplumber
import io
import logging

logger = logging.getLogger(__name__)


def extract_resume_text(pdf_bytes: bytes) -> str:
    """
    Extract text from a PDF resume.

    Args:
        pdf_bytes: Raw bytes of the uploaded PDF file.

    Returns:
        Extracted text as a single string with pages separated by double newlines.

    Raises:
        ValueError: If no text can be extracted (e.g., scanned image PDF).
    """
    text_parts = []
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            logger.info(f"Parsing PDF with {len(pdf.pages)} page(s)")
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    text_parts.append(text.strip())
                    logger.debug(f"Page {i + 1}: extracted {len(text)} chars")
                else:
                    logger.warning(f"Page {i + 1}: no text extracted")
    except Exception as e:
        logger.error(f"Failed to parse PDF: {e}")
        raise ValueError(f"Failed to parse PDF file: {str(e)}")

    full_text = "\n\n".join(text_parts)
    if not full_text.strip():
        raise ValueError(
            "Could not extract text from PDF. "
            "Ensure it is not a scanned image — only text-based PDFs are supported."
        )

    logger.info(f"Successfully extracted {len(full_text)} chars from resume")
    return full_text
