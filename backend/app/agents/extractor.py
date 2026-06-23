import google.generativeai as genai
from pydantic import BaseModel, Field
from typing import List
from backend.app.core.config import settings

class EventItem(BaseModel):
    title: str = Field(description="Name of the historical event, battle, treaty, or reform")
    description: str = Field(description="Brief historical summary of what occurred during this event")
    date_raw: str = Field(description="Raw representation of the date as mentioned in the text, e.g., '1556 CE', 'circa 1582'")
    date_iso: str = Field(description="Normalized date representation (YYYY-MM-DD or simply YYYY if month/day are unknown), e.g., '1556-01-01'")

class EntityItem(BaseModel):
    name: str = Field(description="Exact name of the historical person, geographic place, dynasty, organization, text, religious tradition, or event")
    type: str = Field(description="Type of entity. Must be exactly one of: 'Person', 'Place', 'Dynasty', 'Organization', 'Historical Text', 'Religious Tradition', 'Historical Event'")
    relevance_score: int = Field(description="Estimation of entity importance/usefulness to the historical query context from 0 (generic term/irrelevant) to 100 (specific key actor/crucial subject)")

class ExtractionResponse(BaseModel):
    events: List[EventItem] = Field(description="List of chronological events extracted from the text")
    entities: List[EntityItem] = Field(description="List of significant historical entities extracted from the text")
    source_confidence_score: int = Field(description="An overall usefulness score from 0 (irrelevant) to 100 (direct primary context/extremely useful) of this document's value to historical inquiry")
    source_confidence_rationale: str = Field(description="A brief explanation of why this confidence score was assigned to the document")

def run_extraction(text: str, api_key: str) -> ExtractionResponse:
    """
    Calls Gemini API with structured outputs to extract events, entities,
    and evaluate the source document's usefulness score in a single call.
    """
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set. Please configure it in your environment settings.")

    # Configure the Gemini API client
    genai.configure(api_key=api_key)
    
    # Initialize the model (Gemini 3.1 Flash Lite is ideal for fast, cost-efficient, high-volume extraction)
    model = genai.GenerativeModel('gemini-3.1-flash-lite')
    
    prompt = (
        "You are an expert historical research agent. Read the following source text and extract:\n"
        "1. All notable historical events, battles, accessions, administrative changes, or treaties mentioned, including dates.\n"
        "2. All key historical figures (people), locations (places), dynasties/empires, organizations/reforms, historical texts, religious traditions, or events. Rank each entity's usefulness from 0 to 100 (e.g. key figures = 90+, generic words like countries/regions = 10-30).\n"
        "3. Evaluate the overall usefulness/credibility score (0 to 100) of this source document for investigating historical topics related to its content, and provide a short rationale.\n\n"
        f"Source Text:\n{text}"
    )
    
    # Request structured JSON matching our Pydantic schema
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=ExtractionResponse
        )
    )
    
    # Parse the returned JSON directly using Pydantic validation
    extracted_data = ExtractionResponse.model_validate_json(response.text)
    return extracted_data
