from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel

class ValidationResult(BaseModel):
    is_valid: bool
    char_count: int
    max_chars: int
    remaining_chars: int
    warnings: List[str] = []
    errors: List[str] = []

class PublishResult(BaseModel):
    success: bool
    platform: str
    platform_post_id: Optional[str] = None
    post_url: Optional[str] = None
    error_message: Optional[str] = None

class BasePublisher(ABC):
    @abstractmethod
    def validate(self, text: str, media_urls: Optional[List[str]] = None) -> ValidationResult:
        pass

    @abstractmethod
    async def publish(
        self,
        text: str,
        media_urls: Optional[List[str]] = None
    ) -> PublishResult:
        pass
