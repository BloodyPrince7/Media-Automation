import re
from typing import List, Optional
import httpx
from app.config import settings
from app.publishers.base import BasePublisher, ValidationResult, PublishResult

class InstagramPublisher(BasePublisher):
    """
    Publisher for Instagram via Meta Graph API (Professional/Creator Account).
    Supports single photo, video, and multi-photo carousel publishing.
    """

    def validate(self, text: str, media_urls: Optional[List[str]] = None) -> ValidationResult:
        errors = []
        warnings = []
        max_chars = 2200

        clean_text = text or ""
        char_count = len(clean_text)

        # Instagram strictly mandates at least one image or video attachment
        if not media_urls or len(media_urls) == 0:
            errors.append("Instagram requires at least one photo or video attachment.")

        if char_count > max_chars:
            errors.append(f"Caption exceeds Instagram's 2,200 character limit by {char_count - max_chars} characters.")

        # Check hashtag limit (Instagram allows up to 30 hashtags)
        hashtags = re.findall(r"#\w+", clean_text)
        if len(hashtags) > 30:
            warnings.append(f"Post contains {len(hashtags)} hashtags. Instagram caps hashtags at 30 per post.")

        return ValidationResult(
            is_valid=len(errors) == 0,
            char_count=char_count,
            max_chars=max_chars,
            remaining_chars=max_chars - char_count,
            warnings=warnings,
            errors=errors
        )

    async def _ensure_public_media_url(self, client: httpx.AsyncClient, media_url: str) -> str:
        """
        Instagram Graph API strictly requires publicly accessible URLs and aspect ratios between 4:5 (0.8) and 1.91:1.
        If the media is local (e.g. /uploads/...), this method:
        1. Opens the image with PIL and verifies its aspect ratio.
        2. Adds subtle padding if outside the 0.8 - 1.91 ratio range to prevent Meta 400 rejection.
        3. Uploads the processed image to freeimage.host to obtain a fast direct CDN URL.
        """
        if media_url.startswith("http://") or media_url.startswith("https://"):
            if not ("localhost" in media_url or "127.0.0.1" in media_url):
                return media_url

        from pathlib import Path
        from app.config import UPLOADS_DIR
        from PIL import Image

        filename = Path(media_url).name
        file_path = UPLOADS_DIR / filename
        if not file_path.exists():
            return media_url

        if filename.lower().endswith((".mp4", ".mov")):
            return media_url

        try:
            with Image.open(file_path) as orig:
                img = orig.convert("RGB")
                w, h = img.size
                ratio = w / h if h > 0 else 1.0

                # Instagram accepts 4:5 (0.80) to 1.91:1
                if ratio > 1.91:
                    new_h = int(w / 1.90)
                    padded = Image.new("RGB", (w, new_h), (255, 255, 255))
                    padded.paste(img, (0, (new_h - h) // 2))
                    img = padded
                elif ratio < 0.80:
                    new_w = int(h * 0.80)
                    padded = Image.new("RGB", (new_w, h), (255, 255, 255))
                    padded.paste(img, ((new_w - w) // 2, 0))
                    img = padded

                import tempfile
                with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                    tmp_name = tmp.name
                    img.save(tmp_name, "JPEG", quality=92)

            try:
                with open(tmp_name, "rb") as f:
                    resp = await client.post(
                        "https://freeimage.host/api/1/upload",
                        data={"key": "6d207e02198a847aa98d0a2a901485a5", "action": "upload", "format": "json"},
                        files={"source": ("image.jpg", f, "image/jpeg")},
                        timeout=30.0
                    )
                if resp.status_code == 200:
                    data = resp.json()
                    pub_url = data.get("image", {}).get("url")
                    if pub_url:
                        return pub_url
            finally:
                import os
                if os.path.exists(tmp_name):
                    os.remove(tmp_name)

        except Exception as err:
            print(f"[InstagramPublisher] Media preparation warning: {err}")

        return media_url

    async def publish(
        self,
        text: str,
        media_urls: Optional[List[str]] = None
    ) -> PublishResult:
        # Validate pre-conditions
        validation = self.validate(text, media_urls)
        if not validation.is_valid:
            return PublishResult(
                success=False,
                platform="instagram",
                error_message="; ".join(validation.errors)
            )

        # Verify configured credentials
        token = settings.INSTAGRAM_ACCESS_TOKEN
        account_id = settings.INSTAGRAM_ACCOUNT_ID

        if not token or not account_id:
            return PublishResult(
                success=False,
                platform="instagram",
                error_message="Instagram Graph API credentials missing. Please configure Access Token and Account ID in Channel Settings."
            )

        token = token.strip()
        account_id = account_id.strip()

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                graph_base = "https://graph.instagram.com/v19.0" if token.startswith("IGA") else "https://graph.facebook.com/v19.0"

                # Case A: Single Photo Publication
                if len(media_urls) == 1:
                    raw_media = media_urls[0]
                    primary_media = await self._ensure_public_media_url(client, raw_media)
                    is_video = primary_media.endswith((".mp4", ".mov"))

                    # Step 1: Create Container
                    container_payload = {
                        "access_token": token,
                        "caption": text.strip()
                    }
                    if is_video:
                        container_payload["media_type"] = "REELS"
                        container_payload["video_url"] = primary_media
                    else:
                        container_payload["image_url"] = primary_media

                    c_resp = await client.post(
                        f"{graph_base}/{account_id}/media",
                        params=container_payload
                    )
                    c_data = c_resp.json()

                    if c_resp.status_code != 200 or "id" not in c_data:
                        err_msg = c_data.get("error", {}).get("message", c_resp.text)
                        return PublishResult(
                            success=False,
                            platform="instagram",
                            error_message=f"Instagram container creation error ({c_resp.status_code}): {err_msg}"
                        )

                    creation_id = c_data["id"]

                # Case B: Multi-Image Carousel (up to 10 images)
                else:
                    item_ids = []
                    for m_url in media_urls[:10]:
                        pub_url = await self._ensure_public_media_url(client, m_url)
                        item_payload = {
                            "image_url": pub_url,
                            "is_carousel_item": "true",
                            "access_token": token
                        }
                        item_resp = await client.post(
                            f"{graph_base}/{account_id}/media",
                            params=item_payload
                        )
                        item_data = item_resp.json()
                        if item_resp.status_code == 200 and "id" in item_data:
                            item_ids.append(item_data["id"])

                    if not item_ids:
                        return PublishResult(
                            success=False,
                            platform="instagram",
                            error_message="Failed to prepare carousel items on Instagram."
                        )

                    # Create carousel parent container
                    carousel_payload = {
                        "media_type": "CAROUSEL",
                        "children": ",".join(item_ids),
                        "caption": text.strip(),
                        "access_token": token
                    }
                    car_resp = await client.post(
                        f"{graph_base}/{account_id}/media",
                        params=carousel_payload
                    )
                    car_data = car_resp.json()
                    if car_resp.status_code != 200 or "id" not in car_data:
                        err_msg = car_data.get("error", {}).get("message", car_resp.text)
                        return PublishResult(
                            success=False,
                            platform="instagram",
                            error_message=f"Instagram carousel creation error: {err_msg}"
                        )

                    creation_id = car_data["id"]

                # Step 2: Publish the Container
                pub_resp = await client.post(
                    f"{graph_base}/{account_id}/media_publish",
                    params={
                        "creation_id": creation_id,
                        "access_token": token
                    }
                )
                pub_data = pub_resp.json()

                if pub_resp.status_code != 200 or "id" not in pub_data:
                    err_msg = pub_data.get("error", {}).get("message", pub_resp.text)
                    return PublishResult(
                        success=False,
                        platform="instagram",
                        error_message=f"Instagram publish dispatch error ({pub_resp.status_code}): {err_msg}"
                    )

                media_id = pub_data["id"]

                # Step 3: Retrieve Post Permalink
                permalink = f"https://www.instagram.com/p/{media_id}/"
                try:
                    meta_resp = await client.get(
                        f"{graph_base}/{media_id}",
                        params={
                            "fields": "permalink,shortcode",
                            "access_token": token
                        }
                    )
                    if meta_resp.status_code == 200:
                        permalink = meta_resp.json().get("permalink", permalink)
                except Exception:
                    pass

                return PublishResult(
                    success=True,
                    platform="instagram",
                    platform_post_id=media_id,
                    post_url=permalink
                )

        except Exception as exc:
            return PublishResult(
                success=False,
                platform="instagram",
                error_message=f"Instagram Network Error: {str(exc)}"
            )
