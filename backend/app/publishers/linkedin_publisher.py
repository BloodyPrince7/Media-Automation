import os
from typing import List, Optional
import httpx
from app.config import settings, UPLOADS_DIR
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

    async def _upload_image_asset(self, client: httpx.AsyncClient, file_path: str) -> Optional[str]:
        """Registers and uploads an image to LinkedIn Assets API, returning the asset URN."""
        headers = {
            "Authorization": f"Bearer {settings.LINKEDIN_ACCESS_TOKEN.strip()}",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json"
        }
        reg_payload = {
            "registerUploadRequest": {
                "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                "owner": settings.LINKEDIN_AUTHOR_URN.strip(),
                "supportedUploadMechanism": ["SYNCHRONOUS_UPLOAD"]
            }
        }
        reg_resp = await client.post(
            "https://api.linkedin.com/v2/assets?action=registerUpload",
            headers=headers,
            json=reg_payload
        )
        if reg_resp.status_code not in [200, 201]:
            print(f"LinkedIn asset registration failed: {reg_resp.text}")
            return None

        val = reg_resp.json().get("value", {})
        asset_urn = val.get("asset")
        upload_mechanism = val.get("uploadMechanism", {})
        media_upload_request = upload_mechanism.get(
            "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest", {}
        )
        upload_url = media_upload_request.get("uploadUrl")

        if not asset_urn or not upload_url:
            return None

        with open(file_path, "rb") as f:
            file_bytes = f.read()

        upload_headers = {
            "Authorization": f"Bearer {settings.LINKEDIN_ACCESS_TOKEN.strip()}"
        }
        put_resp = await client.put(upload_url, headers=upload_headers, content=file_bytes)
        if put_resp.status_code in [200, 201]:
            return asset_urn
        else:
            print(f"LinkedIn binary upload failed: {put_resp.status_code} {put_resp.text}")
            return None

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
            async with httpx.AsyncClient(timeout=45.0) as client:
                # Handle image uploads if attached
                media_items = []
                for m_url in media_urls[:9]:
                    clean_filename = m_url.replace("/uploads/", "").lstrip("/").split("?")[0]
                    local_path = UPLOADS_DIR / clean_filename
                    if os.path.exists(local_path):
                        ext = os.path.splitext(local_path)[1].lower()
                        if ext in [".png", ".jpg", ".jpeg", ".gif", ".webp"]:
                            asset_urn = await self._upload_image_asset(client, str(local_path))
                            if asset_urn:
                                media_items.append({
                                    "status": "READY",
                                    "description": {"text": text[:100].strip()},
                                    "media": asset_urn,
                                    "title": {"text": "Media Attachment"}
                                })

                headers = {
                    "Authorization": f"Bearer {settings.LINKEDIN_ACCESS_TOKEN.strip()}",
                    "X-Restli-Protocol-Version": "2.0.0",
                    "Content-Type": "application/json"
                }

                share_content = {
                    "shareCommentary": {
                        "text": text.strip()
                    }
                }
                if media_items:
                    share_content["shareMediaCategory"] = "IMAGE"
                    share_content["media"] = media_items
                else:
                    share_content["shareMediaCategory"] = "NONE"

                payload = {
                    "author": settings.LINKEDIN_AUTHOR_URN.strip(),
                    "lifecycleState": "PUBLISHED",
                    "specificContent": {
                        "com.linkedin.ugc.ShareContent": share_content
                    },
                    "visibility": {
                        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                    }
                }

                response = await client.post(
                    "https://api.linkedin.com/v2/ugcPosts",
                    headers=headers,
                    json=payload
                )

                if response.status_code in [201, 200]:
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
