import os
from typing import List, Optional
import httpx
from requests_oauthlib import OAuth1Session
import tweepy
from app.config import settings, UPLOADS_DIR
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

        # 1. Validate content
        val = self.validate(text, media_urls)
        if not val.is_valid:
            return PublishResult(
                success=False,
                platform="x",
                error_message="; ".join(val.errors)
            )

        # 2. Check credentials presence
        if not self.is_configured():
            return PublishResult(
                success=False,
                platform="x",
                error_message="X API credentials missing. Please set your API Key, Secret, and Access Tokens in Settings."
            )

        api_key = settings.X_API_KEY.strip()
        api_secret = settings.X_API_SECRET.strip()
        access_token = settings.X_ACCESS_TOKEN.strip()
        access_secret = settings.X_ACCESS_TOKEN_SECRET.strip()
        bearer_token = settings.X_BEARER_TOKEN.strip() if settings.X_BEARER_TOKEN else None

        media_ids = []

        # 3. Handle media uploads if present (v1.1 endpoint)
        if media_urls:
            try:
                auth = tweepy.OAuth1UserHandler(
                    api_key, api_secret, access_token, access_secret
                )
                api = tweepy.API(auth)
                for m_url in media_urls[:self.MAX_IMAGES]:
                    clean_path = m_url.replace("/uploads/", "").lstrip("/")
                    local_filepath = UPLOADS_DIR / clean_path
                    if os.path.exists(local_filepath):
                        media_resp = api.media_upload(filename=str(local_filepath))
                        media_ids.append(media_resp.media_id_string)
            except Exception as media_err:
                print(f"Media upload warning: {media_err}")
                # If Free tier blocks v1.1 media upload, we proceed with text publishing

        # 4. Post tweet via Twitter API v2
        try:
            oauth = OAuth1Session(
                client_key=api_key,
                client_secret=api_secret,
                resource_owner_key=access_token,
                resource_owner_secret=access_secret
            )

            payload = {"text": text.strip()}
            if media_ids:
                payload["media"] = {"media_ids": media_ids}

            response = oauth.post(
                "https://api.twitter.com/2/tweets",
                json=payload,
                headers={"Content-Type": "application/json"}
            )

            if response.status_code in [200, 201]:
                res_json = response.json()
                tweet_id = str(res_json["data"]["id"])
                return PublishResult(
                    success=True,
                    platform="x",
                    platform_post_id=tweet_id,
                    post_url=f"https://x.com/i/web/status/{tweet_id}"
                )
            elif response.status_code == 402 or "credits-depleted" in response.text:
                return PublishResult(
                    success=False,
                    platform="x",
                    error_message="X API Error 402: Monthly credits depleted on your X Developer account. Please check your usage on console.x.com."
                )
            else:
                return PublishResult(
                    success=False,
                    platform="x",
                    error_message=f"X API Error ({response.status_code}): {response.text}"
                )

        except Exception as e:
            err_msg = str(e)
            if hasattr(e, 'response') and hasattr(e.response, 'text'):
                err_msg += f" - Response: {e.response.text}"
            return PublishResult(
                success=False,
                platform="x",
                error_message=f"X API Error: {err_msg}"
            )
