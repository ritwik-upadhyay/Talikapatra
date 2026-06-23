from typing import List, Dict

# Standard set of generic or overly broad terms to ignore during historical expansion
GENERIC_BLACKLIST = {
    "india", "history", "asia", "bihar", "patna", "university", "world", "earth", 
    "geography", "timeline", "chronology", "academic", "research", "wikipedia", 
    "country", "empire", "dynasty", "state", "kingdom", "government", "religion",
    "buddhism", "hinduism", "archaeology", "excavation", "site", "century", "bc", "ad", "ce"
}

def select_expansion_candidates(entities: List[Dict], limit: int = 3) -> List[str]:
    """
    Selects the most specific, high-relevance entities for secondary context expansion.
    Uses rule-based blacklist filtering and sorting by relevance score (0-100).
    """
    candidates = []
    seen = set()

    for entity in entities:
        name = entity.get("name", "").strip()
        category = entity.get("type", "").strip()
        score = entity.get("relevance_score", 50)

        # Basic validations
        if not name or len(name) <= 2:
            continue

        # Case-insensitive blacklist checks
        name_lower = name.lower()
        if name_lower in GENERIC_BLACKLIST:
            continue
            
        # Filter out if any blacklist term is a exact word match in the name
        words = name_lower.split()
        if any(w in GENERIC_BLACKLIST for w in words):
            # Exception: keep specific actors like "Pala Empire" or "Gupta Empire" if the score is very high
            if "empire" in words and score >= 80:
                pass
            else:
                continue

        # Skip duplicates
        if name_lower in seen:
            continue

        candidates.append((name, score))
        seen.add(name_lower)

    # Sort candidates by relevance score descending
    candidates.sort(key=lambda x: x[1], reverse=True)

    # Return top N names
    top_candidates = [name for name, _ in candidates[:limit]]
    return top_candidates
