import os
import shutil
import uuid
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.config import settings, UPLOADS_DIR
from app.database import get_db, init_db
from app.models import Post, PublishLog
from app.schemas import (
    PostCreate, PostUpdate, PostOut,
    SettingsOut, SettingsUpdate,
    AIAdaptRequest, AIAdaptResponse,
    PlatformValidationResponse
)
from app.publishers import get_publisher
from app.scheduler import start_scheduler, shutdown_scheduler, execute_post_publication
from app.ai_service import adapt_content_with_gemini

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    start_scheduler()
    yield
    shutdown_scheduler()

app = FastAPI(
    title="Social Pulse Studio API",
    description="Next-Gen AI Social Media Post Automation & Distribution Engine",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded media files
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


# --- HEALTH CHECK ---
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# --- POST VALIDATION ---
@app.post("/api/validate", response_model=PlatformValidationResponse)
def validate_content(payload: dict):
    text = payload.get("text", "")
    x_override = payload.get("x_text") or text
    li_override = payload.get("linkedin_text") or text
    media_urls = payload.get("media_urls", [])

    x_val = get_publisher("x").validate(x_override, media_urls)
    li_val = get_publisher("linkedin").validate(li_override, media_urls)

    return PlatformValidationResponse(
        x=x_val,
        linkedin=li_val
    )


# --- MEDIA UPLOAD ---
@app.post("/api/media/upload")
async def upload_media(file: UploadFile = File(...)):
    allowed_exts = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".mp4", ".mov"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Unsupported file type '{ext}'. Allowed: {allowed_exts}")

    unique_filename = f"{uuid.uuid4().hex}{ext}"
    target_path = UPLOADS_DIR / unique_filename

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": unique_filename,
        "url": f"/uploads/{unique_filename}",
        "size": target_path.stat().st_size
    }


# --- POSTS CRUD ---
@app.get("/api/posts", response_model=List[PostOut])
def get_posts(
    status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Post)
    if status:
        query = query.filter(Post.status == status.upper())
    posts = query.order_by(Post.created_at.desc()).limit(limit).all()
    return posts


@app.get("/api/posts/{post_id}", response_model=PostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@app.post("/api/posts", response_model=PostOut)
async def create_post(payload: PostCreate, db: Session = Depends(get_db)):
    # Determine initial status
    initial_status = "DRAFT"
    if payload.publish_immediately:
        initial_status = "PUBLISHING"
    elif payload.scheduled_at:
        initial_status = "SCHEDULED"

    post = Post(
        title=payload.title,
        content=payload.content,
        x_content=payload.x_content,
        linkedin_content=payload.linkedin_content,
        status=initial_status,
        scheduled_at=payload.scheduled_at
    )
    post.media_urls = payload.media_urls
    post.target_platforms = payload.target_platforms

    db.add(post)
    db.commit()
    db.refresh(post)

    if payload.publish_immediately:
        # Trigger background execution immediately
        import asyncio
        asyncio.create_task(execute_post_publication(post.id))

    return post


@app.put("/api/posts/{post_id}", response_model=PostOut)
def update_post(post_id: int, payload: PostUpdate, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if payload.title is not None:
        post.title = payload.title
    if payload.content is not None:
        post.content = payload.content
    if payload.x_content is not None:
        post.x_content = payload.x_content
    if payload.linkedin_content is not None:
        post.linkedin_content = payload.linkedin_content
    if payload.media_urls is not None:
        post.media_urls = payload.media_urls
    if payload.target_platforms is not None:
        post.target_platforms = payload.target_platforms
    if payload.scheduled_at is not None:
        post.scheduled_at = payload.scheduled_at
        if post.status in ["DRAFT", "FAILED"]:
            post.status = "SCHEDULED"
    if payload.status is not None:
        post.status = payload.status

    db.commit()
    db.refresh(post)
    return post


@app.delete("/api/posts/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully", "id": post_id}


@app.post("/api/posts/{post_id}/publish")
async def trigger_publish(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    await execute_post_publication(post.id)
    db.refresh(post)
    return post


# --- AI ADAPTATION & SYNTHESIS ---
@app.post("/api/ai/adapt", response_model=AIAdaptResponse)
async def ai_adapt(req: AIAdaptRequest):
    result = await adapt_content_with_gemini(
        topic_or_draft=req.topic_or_draft,
        tone=req.tone or "engaging"
    )
    return AIAdaptResponse(
        x_text=result["x_text"],
        linkedin_text=result["linkedin_text"],
        suggested_hashtags=result["suggested_hashtags"]
    )


# --- SETTINGS / CREDENTIALS STATUS ---
@app.get("/api/settings", response_model=SettingsOut)
def get_settings():
    return SettingsOut(
        has_x_credentials=bool(settings.X_API_KEY and settings.X_ACCESS_TOKEN),
        has_linkedin_credentials=bool(settings.LINKEDIN_ACCESS_TOKEN and settings.LINKEDIN_AUTHOR_URN),
        has_gemini_credentials=bool(settings.GEMINI_API_KEY),
        linkedin_author_urn=settings.LINKEDIN_AUTHOR_URN
    )


@app.post("/api/settings")
def update_settings(update: SettingsUpdate):
    if update.x_api_key is not None:
        settings.X_API_KEY = update.x_api_key
    if update.x_api_secret is not None:
        settings.X_API_SECRET = update.x_api_secret
    if update.x_access_token is not None:
        settings.X_ACCESS_TOKEN = update.x_access_token
    if update.x_access_token_secret is not None:
        settings.X_ACCESS_TOKEN_SECRET = update.x_access_token_secret
    if update.x_bearer_token is not None:
        settings.X_BEARER_TOKEN = update.x_bearer_token
    if update.linkedin_access_token is not None:
        settings.LINKEDIN_ACCESS_TOKEN = update.linkedin_access_token
    if update.linkedin_author_urn is not None:
        settings.LINKEDIN_AUTHOR_URN = update.linkedin_author_urn
    if update.gemini_api_key is not None:
        settings.GEMINI_API_KEY = update.gemini_api_key

    return {
        "message": "Settings updated",
        "has_x_credentials": bool(settings.X_API_KEY and settings.X_ACCESS_TOKEN),
        "has_linkedin_credentials": bool(settings.LINKEDIN_ACCESS_TOKEN and settings.LINKEDIN_AUTHOR_URN),
        "has_gemini_credentials": bool(settings.GEMINI_API_KEY)
    }
