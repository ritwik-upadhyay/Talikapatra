import google.generativeai as genai
from pydantic import BaseModel, Field
from typing import List

class RankedArticleMetadata(BaseModel):
    title: str = Field(description="Exact title of the candidate Wikipedia article")
    pageid: int = Field(description="Page ID of the candidate Wikipedia article")
    relevance_score: int = Field(description="Relevance score from 0 (completely irrelevant) to 100 (extremely specific and relevant)")
    reason: str = Field(description="Brief reason explaining why this article is relevant or irrelevant, assessing evidence/actor density")

class ClassificationAndRankingResponse(BaseModel):
    search_intent: str = Field(
        description="The primary historical research intent. Must be exactly one of: "
                    "'Person Research', 'Event Research', 'Historical Debate', "
                    "'Long-Term Historical Process', or 'Textual Research'"
    )
    ranked_articles: List[RankedArticleMetadata] = Field(description="List of ranked articles with relevance scores and reasoning")

def classify_and_rank(query: str, candidates: List[dict], api_key: str) -> ClassificationAndRankingResponse:
    """
    Consolidated agent that classifies the research intent of the query
    and ranks search results in a single Gemini API call.
    """
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured.")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-3.1-flash-lite')

    # Format candidates list for the prompt
    candidate_texts = []
    for idx, c in enumerate(candidates):
        candidate_texts.append(
            f"Index: {idx}\n"
            f"Title: {c.get('title')}\n"
            f"Snippet: {c.get('snippet', '').strip()}\n"
            f"Page ID: {c.get('pageid')}\n"
        )
    candidates_context = "\n---\n".join(candidate_texts)

    prompt = (
        "You are an expert historical research assistant. Your task is twofold:\n"
        "1. Classify the user's research query into one of these 5 categories:\n"
        "   - 'Person Research': Investigating a specific individual (e.g. accessions, policies, biographies)\n"
        "   - 'Event Research': Analyzing a specific occurrence, battle, treaty, or incident\n"
        "   - 'Historical Debate': Exploring topics with conflicting interpretations, differing theories, or uncertainty (e.g. collapse causes, migrations, destructions)\n"
        "   - 'Long-Term Historical Process': Investigating long-term political, cultural, or religious changes (e.g. decline of religions, rise of empires)\n"
        "   - 'Textual Research': Studying specific ancient manuscripts, treatises, or writings\n\n"
        "2. Rank the provided Wikipedia candidate articles based on their relevance to investigating the query:\n"
        "   - Reward specificity: Give high scores to direct entities, institutions, primary historical subjects, and key actors.\n"
        "   - Penalize generic/broad entries: Give lower scores to broad geographic/regional articles (e.g., 'India', 'Bihar', 'Asia', 'History') unless the query explicitly demands it.\n"
        "   - Be selective: Output a score for every candidate reflecting its research usefulness.\n\n"
        f"Research Query: \"{query}\"\n\n"
        f"Candidate Articles:\n{candidates_context}\n"
    )

    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=ClassificationAndRankingResponse
        )
    )

    result = ClassificationAndRankingResponse.model_validate_json(response.text)
    return result
