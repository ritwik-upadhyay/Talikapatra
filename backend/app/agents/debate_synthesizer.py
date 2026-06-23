import google.generativeai as genai
from pydantic import BaseModel, Field

class SynthesisResult(BaseModel):
    debate_detected: bool = Field(
        description="True if the compiled research corpus contains meaningful conflicting explanations, "
                    "contradictory evidence, competing interpretations, or uncertainty in source material. "
                    "False if there is general historical consensus."
    )
    confidence_score: int = Field(description="Confidence score from 0 to 100 regarding the debate detection.")
    reason: str = Field(description="Brief explanation of why a debate was or was not detected in the corpus.")
    synthesis_markdown: str = Field(
        description="The final synthesized markdown document. If debate_detected = True, this MUST include: "
                    "Interpretation A (Sources & Evidence), Interpretation B (Sources & Evidence), "
                    "Interpretation C (if any), Areas of Agreement, Areas of Disagreement. "
                    "If debate_detected = False, this MUST be a Standard Historical Synthesis "
                    "synthesizing the consensus narrative, key themes, and chronological summary."
    )

def synthesize_research(query: str, compiled_corpus: str, api_key: str) -> SynthesisResult:
    """
    Consolidated agent that detects the presence of historical debate
    and generates the appropriate synthesis report in a single call.
    """
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured.")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-3.1-flash-lite')

    prompt = (
        "You are an expert historical research synthesizer. Read the following compiled research corpus "
        "and answer the user's research query by synthesizing the evidence.\n\n"
        "Instructions:\n"
        "1. First, check if there is meaningful disagreement, competing interpretations, or uncertainty "
        "   regarding this topic in the source material. Fill in 'debate_detected' and 'confidence_score' accordingly.\n"
        "2. Generate the 'synthesis_markdown' body strictly following these rules:\n"
        "   - If debate_detected = True:\n"
        "     Structure the response as a 'Historical Debate Report'. Compare competing interpretations (e.g. Interpretation A, "
        "     Interpretation B), cite their specific sources, list the primary evidence supporting each, and conclude "
        "     with a clear summary of Areas of Agreement and Areas of Disagreement.\n"
        "   - If debate_detected = False:\n"
        "     Structure the response as a 'Standard Historical Synthesis'. Provide a cohesive consensus narrative, "
        "     summarizing key chronological themes, facts, and the general historical consensus.\n"
        "   - Grounding: Always cite the source documents inline using standard markdown links/brackets (e.g. '[Nalanda]').\n\n"
        f"User Research Query: \"{query}\"\n\n"
        f"Compiled Research Corpus:\n{compiled_corpus}\n"
    )

    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=SynthesisResult
        )
    )

    result = SynthesisResult.model_validate_json(response.text)
    return result
