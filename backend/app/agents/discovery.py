import httpx
import asyncio
from typing import Tuple, List, Optional, Dict

async def search_wikipedia_metadata(query: str, limit: int = 10) -> List[Dict]:
    """
    Queries the Wikipedia API to find the top N matching articles
    and returns a list of metadata dictionaries (title, snippet, url, pageid).
    Does NOT download full page content.
    """
    search_url = "https://en.wikipedia.org/w/api.php"
    search_params = {
        "action": "query",
        "format": "json",
        "list": "search",
        "srsearch": query,
        "utf8": 1,
        "formatversion": 2
    }
    
    headers = {
        "User-Agent": "TalikapatraHistoricalResearchEngine/1.0 (contact: ritwik@sample.com; academic research MVP)"
    }
    
    async with httpx.AsyncClient(headers=headers) as client:
        try:
            response = await client.get(search_url, params=search_params)
            response.raise_for_status()
            data = response.json()
            
            search_results = data.get("query", {}).get("search", [])
            if not search_results:
                print(f"No Wikipedia results found for: {query}")
                return []
                
            results = []
            for res in search_results[:limit]:
                page_id = res["pageid"]
                title = res["title"]
                snippet = res.get("snippet", "")
                url = f"https://en.wikipedia.org/?curid={page_id}"
                
                results.append({
                    "title": title,
                    "snippet": snippet,
                    "pageid": page_id,
                    "url": url
                })
            return results
        except Exception as e:
            print(f"Error querying Wikipedia API: {str(e)}")
            return []

async def fetch_wikipedia_content(title: str, pageid: int) -> Optional[str]:
    """
    Fetches the plain text extract of a single Wikipedia page by title and page ID.
    """
    search_url = "https://en.wikipedia.org/w/api.php"
    content_params = {
        "action": "query",
        "format": "json",
        "prop": "extracts",
        "explaintext": 1,
        "titles": title,
        "formatversion": 2
    }
    
    headers = {
        "User-Agent": "TalikapatraHistoricalResearchEngine/1.0 (contact: ritwik@sample.com; academic research MVP)"
    }
    
    async with httpx.AsyncClient(headers=headers) as client:
        try:
            content_resp = await client.get(search_url, params=content_params)
            content_resp.raise_for_status()
            content_data = content_resp.json()
            
            pages = content_data.get("query", {}).get("pages", [])
            if not pages:
                return None
                
            page_content = pages[0].get("extract", "")
            return page_content if page_content.strip() else None
        except Exception as ex:
            print(f"Error fetching content for '{title}': {str(ex)}")
            return None

# Keep legacy search_wikipedia for backward compatibility if needed
async def search_wikipedia(query: str, limit: int = 3) -> List[Tuple[str, str, str]]:
    """
    Legacy helper. Query top pages and retrieve full contents.
    """
    metadata = await search_wikipedia_metadata(query, limit=limit)
    if not metadata:
        return []
        
    tasks = []
    for item in metadata:
        tasks.append(fetch_wikipedia_content(item["title"], item["pageid"]))
        
    contents = await asyncio.gather(*tasks)
    results = []
    for idx, item in enumerate(metadata):
        content = contents[idx]
        if content:
            results.append((item["title"], item["url"], content))
    return results
