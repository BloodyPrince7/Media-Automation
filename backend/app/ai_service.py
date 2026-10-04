import json
import os
import mimetypes
from typing import Dict, Any, List, Optional
from app.config import settings, UPLOADS_DIR

def local_heuristic_adaptation(topic_or_draft: str, tone: str = "engaging") -> Dict[str, Any]:
    """Smart heuristic formatter used only when Gemini API is offline or unconfigured."""
    clean_text = topic_or_draft.strip() if topic_or_draft else "Exciting update from our team!"
    
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
        "Key takeaways:",
        ""
    ]
    for pt in body_points:
        linkedin_parts.append(f"• {pt}")
    
    linkedin_parts.extend([
        "",
        "How are you approaching this in your workflow? Share your thoughts below!",
        "",
        "#Leadership #Automation #Technology #GrowthMindset #Productivity"
    ])
    
    linkedin_text = "\n".join(linkedin_parts)

    # Generate Instagram text (Visual hook, storytelling, formatted lines, aesthetic hashtags)
    ig_text = f"✨ {hook}\n\n{first_sentence}\n\nDrop your thoughts in the comments below! 👇\n\n#ContentCreator #VisualStorytelling #SocialMedia #Innovation #TechCommunity"

    return {
        "x_text": x_text,
        "linkedin_text": linkedin_text,
        "instagram_text": ig_text,
        "suggested_hashtags": ["#Automation", "#SocialMedia", "#Tech", "#Growth", "#AI", "#Creator"]
    }

async def adapt_content_with_gemini(
    topic_or_draft: str = "",
    tone: str = "engaging",
    media_urls: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Adapt, caption, and expand content using Google Gemini 3.5 Flash-Lite (Multimodal).
    Understands both attached photo(s) and accompanying draft text.
    """
    media_urls = media_urls or []
    if not settings.GEMINI_API_KEY:
        return local_heuristic_adaptation(topic_or_draft, tone)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY.strip())

        # Load attached images as multimodal parts
        image_parts = []
        for m_url in media_urls[:4]:  # Support up to 4 images
            clean_filename = m_url.replace("/uploads/", "").lstrip("/").split("?")[0]
            local_path = UPLOADS_DIR / clean_filename
            if os.path.exists(local_path):
                # Guess mime type
                mime_type, _ = mimetypes.guess_type(str(local_path))
                if not mime_type:
                    mime_type = "image/png"
                
                # Only attach images for visual analysis
                if mime_type.startswith("image/"):
                    try:
                        with open(local_path, "rb") as img_file:
                            img_data = img_file.read()
                            image_parts.append(
                                types.Part.from_bytes(data=img_data, mime_type=mime_type)
                            )
                    except Exception as read_err:
                        print(f"Error reading image {local_path}: {read_err}")

        # Construct intelligent prompt
        has_images = len(image_parts) > 0
        has_text = bool(topic_or_draft and topic_or_draft.strip())

        prompt = f"""
You are an elite social media strategist, ghostwriter, and creative copywriter.
Tone: {tone}

{"TASK: Analyze the attached image(s) and create compelling social media captions. Blend any user notes with the visual elements, story, and details seen in the photo(s)." if has_images else "TASK: Create compelling social media posts based on the draft notes."}

User Draft Notes / Context:
\"\"\"{topic_or_draft.strip() if has_text else "(No initial text provided - generate descriptive, engaging captions based directly on the attached photo!)"}\"\"\"

Generate tailored posts for each destination channel:
1. "x_text": Optimized for X (Twitter). Must be punchy, viral, attention-grabbing, and STRICTLY under 270 characters including 2-3 high-impact hashtags.
2. "linkedin_text": Tailored for LinkedIn. Must start with an irresistible hook sentence, provide thoughtful context/takeaways matching the visual and text, have neat paragraph spacing, end with an engaging call-to-action question, and include 3-5 relevant hashtags.
3. "instagram_text": Tailored for Instagram. Must begin with an aesthetically pleasing visual hook, tell the story behind the photo/update, use conversational paragraphs, prompt comments with a question, and include 5-8 curated aesthetic hashtags.
4. "suggested_hashtags": A list of 5-8 relevant hashtags.

Respond STRICTLY in valid JSON matching this schema:
{{
  "x_text": "string under 270 characters",
  "linkedin_text": "string with hook and formatted body",
  "instagram_text": "string with visual caption and engaging hashtags",
  "suggested_hashtags": ["#tag1", "#tag2", "#tag3"]
}}
"""

        contents = [prompt] + image_parts

        # Try gemini-3.5-flash-lite first, fallback to gemini-3.8-flash if temporary 503
        models_to_try = ["gemini-3.5-flash-lite", "gemini-3.8-flash"]
        last_error = None

        for model_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )

                if response and response.text:
                    text_content = response.text.strip()
                    # Clean markdown wrappers if any
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
                        "instagram_text": parsed.get("instagram_text", ""),
                        "suggested_hashtags": parsed.get("suggested_hashtags", [])
                    }
            except Exception as model_err:
                last_error = model_err
                print(f"Model {model_name} failed: {model_err}, trying next...")

        print(f"All Gemini models failed: {last_error}, falling back to heuristic")
        return local_heuristic_adaptation(topic_or_draft, tone)

    except Exception as e:
        print(f"Gemini API initialization error: {e}")
        return local_heuristic_adaptation(topic_or_draft, tone)


async def suggest_reply_with_gemini(
    post_content: str,
    comment_text: str,
    tone: str = "engaging"
) -> List[str]:
    """Generate 3 smart, tailored reply suggestions using Gemini 3.5 Flash-Lite."""
    default_fallbacks = [
        "Thanks so much for reading and sharing your thoughts! Really appreciate it. 🙌",
        "Great point! Couldn't agree more with your perspective on this. 🚀",
        "Appreciate the support! What's been your experience with this so far?"
    ]

    if not settings.GEMINI_API_KEY:
        return default_fallbacks

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY.strip())

        prompt = f"""
You are an expert social media manager.
A user left a comment on your post. Draft 3 distinct, highly engaging, authentic reply options.
Tone: {tone}

Original Post:
\"\"\"{post_content.strip()}\"\"\"

User's Comment:
\"\"\"{comment_text.strip()}\"\"\"

Create 3 different options:
- Option 1: Warm, grateful and appreciative.
- Option 2: Insightful, conversational, and adds value.
- Option 3: Short, punchy, and invites further discussion with a quick question.

Respond STRICTLY in JSON format:
{{
  "suggestions": [
    "string reply 1",
    "string reply 2",
    "string reply 3"
  ]
}}
"""
        models_to_try = ["gemini-3.5-flash-lite", "gemini-3.8-flash"]
        for model_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )
                if response and response.text:
                    clean_text = response.text.strip()
                    if clean_text.startswith("```json"):
                        clean_text = clean_text[7:]
                    if clean_text.startswith("```"):
                        clean_text = clean_text[3:]
                    if clean_text.endswith("```"):
                        clean_text = clean_text[:-3]

                    data = json.loads(clean_text)
                    suggestions = data.get("suggestions", [])
                    if suggestions and isinstance(suggestions, list):
                        return suggestions[:3]
            except Exception as err:
                print(f"Reply suggestion with {model_name} failed: {err}")

        return default_fallbacks

    except Exception as e:
        print(f"Error in suggest_reply_with_gemini: {e}")
        return default_fallbacks

