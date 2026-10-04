import os
from typing import List, Optional
import tweepy
from app.config import settings
from app.publishers.base import BasePublisher, ValidationResult, PublishResult

class TwitterPublisher(BasePublisher):
    MAX_CHARS = 280
    MAX_IMAGES = 4

    def validate(self, text: str, media_urls: Optional[List[str]] = None) -> ValidationResult:
        warnings = []
        errors = []
        char_count = len(text.strip())
        media = media_urls or []

        if char_count == 0 and len(media) == 0:
            errors.append("Post content or media is required for X.")

        if char_count > self.MAX_CHARS:
            errors.append(f"Character limit exceeded: {char_count}/{self.MAX_CHARS} characters (Twitter standard limit).")
        elif char_count > 250:
            warnings.append(f"Approaching character limit ({char_count}/{self.MAX_CHARS}).")

        if len(media) > self.MAX_IMAGES:
            errors.append(f"X allows a maximum of {self.MAX_IMAGES} media attachments.")

        return ValidationResult(
            is_valid=len(errors) == 0,
            char_count=char_count,
            max_chars=self.MAX_CHARS,
            remaining_chars=self.MAX_CHARS - char_count,
            warnings=warnings,
            errors=errors
        )

    def is_configured(self) -> bool:
        return bool(
            settings.X_API_KEY and
            settings.X_API_SECRET and
            settings.X_ACCESS_TOKEN and
            settings.X_ACCESS_TOKEN_SECRET
        )

    async def publish(
        self,
        text: str,
        media_urls: Optional[List[str]] = None
    ) -> PublishResult:
        media_urls = media_urls or []

        # Validate before attempting
        val = self.validate(text, media_urls)
        if not val.is_valid:
            return PublishResult(
                success=False,
                platform="x",
                error_message="; ".join(val.errors)
            )

        # Check configured keys
        if not self.is_configured():
            return PublishResult(
                success=False,
                platform="x",
                error_message="X API credentials not configured. Please add your API Key, Secret, and Access Tokens in Settings."
            )

        # Live Twitter API v2 publishing with Tweepy
        try:
            client = tweepy.Client(
                consumer_key=settings.X_API_KEY,
                consumer_secret=settings.X_API_SECRET,
                access_token=settings.X_ACCESS_TOKEN,
                access_token_secret=settings.X_ACCESS_TOKEN_SECRET
            )

            media_ids = []
            if media_urls:
                # Media upload requires v1.1 endpoint with OAuth 1.0a
                auth = tweepy.OAuth1UserHandler(
                    settings.X_API_KEY,
                    settings.X_API_SECRET,
                    settings.X_ACCESS_TOKEN,
                    settings.X_ACCESS_TOKEN_SECRET
                )
                api = tweepy.API(auth)

                for m_url in media_urls[:self.MAX_IMAGES]:
                    # Resolve local filepath from relative URL or path
                    clean_path = m_url.replace("/uploads/", "").lstrip("/")
                    local_filepath = settings.BASE_DIR / "uploads" / clean_path
                    if os.path.exists(local_filepath):
                        media_resp = api.media_upload(filename=str(local_filepath))
                        media_ids.append(media_resp.media_id_string)

            # Create tweet
            response = client.create_tweet(
                text=text.strip(),
                media_ids=media_ids if media_ids else None
            )

            tweet_id = str(response.data["id"])
            return PublishResult(
                success=True,
                platform="x",
                platform_post_id=tweet_id,
                post_url=f"https://x.com/i/web/status/{tweet_id}"
            )

        except Exception as e:
            return PublishResult(
                success=False,
                platform="x",
                error_message=f"X API Error: {str(e)}"
            )
