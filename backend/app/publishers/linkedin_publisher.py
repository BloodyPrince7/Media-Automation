from typing import List, Optional
import httpx
from app.config import settings
from app.publishers.base import BasePublisher, ValidationResult, PublishResult

class LinkedInPublisher(BasePublisher):
    MAX_CHARS = 3000

    def validate(self, text: str, media_urls: Optional[List[str]] = None) -> ValidationResult:
        warnings = []
        errors = []
        char_count = len(text.strip())

        if char_count == 0:
            errors.append("Post commentary is required for LinkedIn.")

        if char_count > self.MAX_CHARS:
            errors.append(f"Character limit exceeded: {char_count}/{self.MAX_CHARS} characters.")
        elif char_count > 2500:
            warnings.append(f"Approaching character limit ({char_count}/{self.MAX_CHARS}).")

        return ValidationResult(
            is_valid=len(errors) == 0,
            char_count=char_count,
            max_chars=self.MAX_CHARS,
            remaining_chars=self.MAX_CHARS - char_count,
            warnings=warnings,
            errors=errors
        )

    def is_configured(self) -> bool:
        return bool(settings.LINKEDIN_ACCESS_TOKEN and settings.LINKEDIN_AUTHOR_URN)

    async def publish(
        self,
        text: str,
        media_urls: Optional[List[str]] = None
    ) -> PublishResult:
        media_urls = media_urls or []

        # Validation
        val = self.validate(text, media_urls)
        if not val.is_valid:
            return PublishResult(
                success=False,
                platform="linkedin",
                error_message="; ".join(val.errors)
            )

        if not self.is_configured():
            return PublishResult(
                success=False,
                platform="linkedin",
                error_message="LinkedIn credentials not configured. Please set your Access Token and Author URN in Settings."
            )

        # Real LinkedIn API call
        try:
            headers = {
                "Authorization": f"Bearer {settings.LINKEDIN_ACCESS_TOKEN}",
                "X-Restli-Protocol-Version": "2.0.0",
                "LinkedIn-Version": "202401",
                "Content-Type": "application/json"
            }

            # Standard LinkedIn Community Posts payload
            payload = {
                "author": settings.LINKEDIN_AUTHOR_URN,
                "commentary": text.strip(),
                "visibility": "PUBLIC",
                "distribution": {
                    "feedDistribution": "MAIN_FEED",
                    "targetEntities": [],
                    "thirdPartyDistributionChannels": []
                },
                "lifecycleState": "PUBLISHED",
                "isReshareDisabledByAuthor": False
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.linkedin.com/rest/posts",
                    headers=headers,
                    json=payload
                )

                if response.status_code in [201, 200]:
                    # Extract post urn from x-restli-id or x-linkedin-id header
                    post_urn = response.headers.get("x-restli-id") or response.headers.get("x-linkedin-id")
                    if not post_urn:
                        data = response.json() if response.content else {}
                        post_urn = data.get("id", "urn:li:post:success")

                    return PublishResult(
                        success=True,
                        platform="linkedin",
                        platform_post_id=post_urn,
                        post_url=f"https://www.linkedin.com/feed/update/{post_urn}/"
                    )
                else:
                    return PublishResult(
                        success=False,
                        platform="linkedin",
                        error_message=f"LinkedIn API error ({response.status_code}): {response.text}"
                    )

        except Exception as e:
            return PublishResult(
                success=False,
                platform="linkedin",
                error_message=f"LinkedIn Network Error: {str(e)}"
            )
