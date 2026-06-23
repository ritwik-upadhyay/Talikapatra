from typing import List

def compile_research_corpus(documents: List) -> str:
    """
    Compiles, structures, and deduplicates the retrieved primary and expanded 
    source documents into a clean historical research corpus text.
    """
    if not documents:
        return "No documents available in the research corpus."

    # Group documents by source_type to establish clear hierarchy
    primary_docs = [d for d in documents if d.source_type == "primary_context"]
    expanded_docs = [d for d in documents if d.source_type == "expanded_context"]
    other_docs = [d for d in documents if d.source_type not in ["primary_context", "expanded_context"]]

    compiled_text = []
    compiled_text.append("=========================================")
    compiled_text.append("        COMPILED RESEARCH CORPUS        ")
    compiled_text.append("=========================================\n")

    # Helper function to append a document to the compiled text
    def append_doc(doc, index, section_name):
        title = doc.title
        url = doc.source_url or "No URL provided"
        score = doc.source_confidence_score or 50
        text = doc.raw_text_content or "[Empty Text]"
        
        # Limit text content to 40,000 characters per document to avoid extreme context bloat
        # while preserving maximum historical density
        if len(text) > 40000:
            text = text[:40000] + "\n... [Truncated for Context Optimization] ..."
            
        compiled_text.append(
            f"--- [{section_name}] Document #{index}: {title} ---\n"
            f"Source URL: {url}\n"
            f"Historical Usefulness Score: {score}/100\n"
            f"Raw Content:\n{text}\n"
            "-----------------------------------------\n"
        )

    # 1. Add Primary Context
    if primary_docs:
        compiled_text.append("=== SECTION 1: PRIMARY CONTEXT SOURCES ===")
        compiled_text.append("Highly relevant source texts fetched directly for the query.\n")
        for idx, doc in enumerate(primary_docs):
            append_doc(doc, idx + 1, "PRIMARY")

    # 2. Add Expanded Context
    if expanded_docs:
        compiled_text.append("\n=== SECTION 2: EXPANDED CONTEXT SOURCES ===")
        compiled_text.append("Connected contextual sources fetched for key historical actors and entities.\n")
        for idx, doc in enumerate(expanded_docs):
            append_doc(doc, idx + 1, "EXPANDED")

    # 3. Add Other Context (User Uploads, etc.)
    if other_docs:
        compiled_text.append("\n=== SECTION 3: OTHER RESEARCH SOURCES ===")
        for idx, doc in enumerate(other_docs):
            append_doc(doc, idx + 1, "OTHER")

    return "\n".join(compiled_text)
