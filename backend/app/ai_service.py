import json
import re
from typing import Dict, Any, List
from app.config import settings

def local_heuristic_adaptation(topic_or_draft: str, tone: str = "engaging") -> Dict[str, Any]:
    """Smart heuristic formatter used when Gemini API key is not configured."""
    clean_text = topic_or_draft.strip()
    
    # Generate X text (Punchy, under 280 chars)
    first_sentence = clean_text.split(".")[0] if "." in clean_text else clean_text
    if len(first_sentence) > 180:
        first_sentence = first_sentence[:177] + "..."
    
    x_tags = "#Tech #BuildInPublic #Innovation"
    x_text = f"🚀 {first_sentence}\n\nWhat are your thoughts on this?\n{x_tags}"
    if len(x_text) > 280:
        x_text = x_text[:275] + "..."

    # Generate LinkedIn text (Structured, hook + body + call to action)
    lines = [l.strip() for l in clean_text.split("\n") if l.strip()]
    hook = lines[0] if lines else "Here is an important takeaway:"
    body_points = lines[1:] if len(lines) > 1 else [
        "1. Focus on scalable systems and automated workflows.",
        "2. Consistent distribution outperforms sporadic effort.",
        "3. High quality content creates lasting network effects."
    ]
    
    linkedin_parts = [
        f"💡 {hook}",
        "",
        "Key takeaways from my recent explorations:",
        ""
    ]
    for pt in body_points:
        linkedin_parts.append(f"• {pt}")
    
    linkedin_parts.extend([
        "",
        "How are you approaching this in your workflow? Would love to hear your insights in the comments.",
        "",
        "#Leadership #Automation #Technology #GrowthMindset #Productivity"
    ])
    
    linkedin_text = "\n".join(linkedin_parts)

    return {
        "x_text": x_text,
        "linkedin_text": linkedin_text,
        "suggested_hashtags": ["#Automation", "#SocialMedia", "#Tech", "#Growth", "#AI"]
    }

async def adapt_content_with_gemini(topic_or_draft: str, tone: str = "engaging") -> Dict[str, Any]:
    """Adapt or expand content using Google Gemini API or smart heuristic fallback."""
    if not settings.GEMINI_API_KEY:
        return local_heuristic_adaptation(topic_or_draft, tone)

    try:
        from google import genai
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        prompt = f"""
You are an elite social media ghostwriter and marketing strategist.
Transform the following draft / concept into two tailored posts:
1. One for X (Twitter): Must be punchy, viral, highly engaging, and STRICTLY under 270 characters including 2-3 hashtags.
2. One for LinkedIn: Must include an attention-grabbing hook, neat spacing with 2-3 concise bullet takeaways, a conversational call-to-action prompt, and 3-5 relevant hashtags.

Tone requested: {tone}

Source input:
\"\"\"
{topic_or_draft}
\"\"\"

Respond STRICTLY in valid JSON matching this schema:
{{
  "x_text": "string under 270 characters",
  "linkedin_text": "string with hooks and bullet points",
  "suggested_hashtags": ["#tag1", "#tag2", "#tag3"]
}}
"""
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        text_content = response.text.strip()
        # Remove any markdown code block wrapper if present
        if text_content.startswith("```json"):
            text_content = text_content[7:]
        if text_content.startswith("```"):
            text_content = text_content[3:]
        if text_content.endswith("```"):
            text_content = text_content[:-3]

        parsed = json.loads(text_content.strip())
        return {
            "x_text": parsed.get("x_text", ""),
            "linkedin_text": parsed.get("linkedin_text", ""),
            "suggested_hashtags": parsed.get("suggested_hashtags", [])
        }
    except Exception as e:
        print(f"Gemini API call failed, falling back to heuristic: {e}")
        return local_heuristic_adaptation(topic_or_draft, tone)
