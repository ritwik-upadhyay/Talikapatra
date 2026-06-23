import pdfplumber
import io

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts plain text from standard native PDF bytes using pdfplumber.
    """
    text_content = []
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_content.append(page_text)
    except Exception as e:
        print(f"Error during PDF parsing: {str(e)}")
        # If parsing fails, raise an exception so the API handler can catch it or fall back
        raise ValueError(f"Could not parse native PDF text: {str(e)}")

    return "\n\n".join(text_content)
