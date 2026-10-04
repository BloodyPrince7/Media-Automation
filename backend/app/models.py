from datetime import datetime, timezone
import json
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    x_content = Column(Text, nullable=True)
    linkedin_content = Column(Text, nullable=True)
    
    # JSON strings
    _media_urls = Column("media_urls", Text, default="[]")
    _target_platforms = Column("target_platforms", Text, default='["x","linkedin"]')
    
    status = Column(String(50), default="DRAFT", index=True)  # DRAFT, SCHEDULED, PUBLISHED, PARTIALLY_PUBLISHED, FAILED, CANCELLED
    scheduled_at = Column(DateTime(timezone=True), nullable=True, index=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    publish_logs = relationship("PublishLog", back_populates="post", cascade="all, delete-orphan", order_by="PublishLog.id.desc()")

    @property
    def media_urls(self):
        try:
            return json.loads(self._media_urls) if self._media_urls else []
        except Exception:
            return []

    @media_urls.setter
    def media_urls(self, val):
        self._media_urls = json.dumps(val or [])

    @property
    def target_platforms(self):
        try:
            return json.loads(self._target_platforms) if self._target_platforms else ["x", "linkedin"]
        except Exception:
            return ["x", "linkedin"]

    @target_platforms.setter
    def target_platforms(self, val):
        self._target_platforms = json.dumps(val or ["x", "linkedin"])


class PublishLog(Base):
    __tablename__ = "publish_logs"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    platform = Column(String(50), nullable=False)  # "x" or "linkedin"
    status = Column(String(50), nullable=False)    # "SUCCESS", "FAILED"
    platform_post_id = Column(String(255), nullable=True)
    post_url = Column(String(500), nullable=True)
    error_message = Column(Text, nullable=True)
    published_at = Column(DateTime(timezone=True), default=utc_now)

    post = relationship("Post", back_populates="publish_logs")


class AppSetting(Base):
    __tablename__ = "app_settings"

    key = Column(String(100), primary_key=True, index=True)
    value = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
