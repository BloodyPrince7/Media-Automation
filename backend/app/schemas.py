from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class PublishLogOut(BaseModel):
    id: int
    post_id: int
    platform: str
    status: str
    platform_post_id: Optional[str] = None
    post_url: Optional[str] = None
    error_message: Optional[str] = None
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PostBase(BaseModel):
    title: Optional[str] = None
    content: str = Field(..., description="Master content")
    x_content: Optional[str] = Field(None, description="Platform-specific override for X")
    linkedin_content: Optional[str] = Field(None, description="Platform-specific override for LinkedIn")
    instagram_content: Optional[str] = Field(None, description="Platform-specific override for Instagram")
    media_urls: List[str] = Field(default_factory=list)
    target_platforms: List[str] = Field(default_factory=lambda: ["x", "linkedin", "instagram"])
    scheduled_at: Optional[datetime] = None

class PostCreate(PostBase):
    publish_immediately: bool = False

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    x_content: Optional[str] = None
    linkedin_content: Optional[str] = None
    instagram_content: Optional[str] = None
    media_urls: Optional[List[str]] = None
    target_platforms: Optional[List[str]] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = None

class PostOut(PostBase):
    id: int
    status: str
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    publish_logs: List[PublishLogOut] = []

    class Config:
        from_attributes = True

class ValidationResult(BaseModel):
    is_valid: bool
    char_count: int
    max_chars: int
    warnings: List[str] = []
    errors: List[str] = []

class PlatformValidationResponse(BaseModel):
    x: ValidationResult
    linkedin: ValidationResult

class SettingsOut(BaseModel):
    has_x_credentials: bool
    has_linkedin_credentials: bool
    has_instagram_credentials: bool = False
    has_gemini_credentials: bool
    linkedin_author_urn: Optional[str] = None
    instagram_account_id: Optional[str] = None
    x_handle: Optional[str] = None

class SettingsUpdate(BaseModel):
    x_api_key: Optional[str] = None
    x_api_secret: Optional[str] = None
    x_access_token: Optional[str] = None
    x_access_token_secret: Optional[str] = None
    x_bearer_token: Optional[str] = None
    linkedin_client_id: Optional[str] = None
    linkedin_client_secret: Optional[str] = None
    linkedin_access_token: Optional[str] = None
    linkedin_author_urn: Optional[str] = None
    instagram_access_token: Optional[str] = None
    instagram_account_id: Optional[str] = None
    gemini_api_key: Optional[str] = None

class AIAdaptRequest(BaseModel):
    topic_or_draft: Optional[str] = ""
    tone: Optional[str] = "engaging" # professional, punchy, informative, humorous
    include_hashtags: bool = True
    media_urls: Optional[List[str]] = Field(default_factory=list)

class AIAdaptResponse(BaseModel):
    x_text: str
    linkedin_text: str
    instagram_text: str = ""
    suggested_hashtags: List[str] = []


class PostCommentCreate(BaseModel):
    platform: str  # "x" or "linkedin"
    content: str
    parent_comment_id: Optional[str] = None


class PostCommentOut(BaseModel):
    id: int
    post_id: int
    platform: str
    author_name: str
    author_handle: Optional[str] = None
    content: str
    is_author_reply: bool = True
    parent_comment_id: Optional[str] = None
    platform_comment_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PlatformMetrics(BaseModel):
    platform: str
    post_url: Optional[str] = None
    platform_post_id: Optional[str] = None
    likes: int = 0
    replies: int = 0
    reposts: int = 0
    impressions: int = 0
    raw_metrics: dict = Field(default_factory=dict)


class PostEngagementOut(BaseModel):
    post_id: int
    metrics: List[PlatformMetrics] = []
    comments: List[PostCommentOut] = []


class AISuggestReplyRequest(BaseModel):
    post_content: str
    comment_text: str
    tone: Optional[str] = "engaging"  # professional, appreciative, witty, conversational


class AISuggestReplyResponse(BaseModel):
    suggestions: List[str] = []

