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
        Instagram Graph API strictly requires:
        1. Publicly accessible HTTP/HTTPS URL.
        2. Aspect ratio between 4:5 (0.80) and 1.91:1.
        
        This method:
        - Retrieves image bytes (from local UPLOADS_DIR or downloads remote URL).
        - Validates aspect ratio with PIL.
        - If ratio < 0.80 (too tall, e.g. 9:16 story/screenshot): auto-pads width to 0.81 (4:5 compliant).
        - If ratio > 1.91 (too wide, e.g. panoramic banner): auto-pads height to 1.90 (1.91:1 compliant).
        - Uploads the compliant asset to CDN (FreeImage) or serves via public server URL.
        """
        import io
        import math
        import os
        import uuid
        from pathlib import Path
        from PIL import Image
        from app.config import UPLOADS_DIR

        # Ignore videos (.mp4, .mov)
        if any(media_url.lower().endswith(ext) for ext in [".mp4", ".mov", ".m4v"]):
            return media_url

        try:
            # 1. Obtain image bytes and source filename
            img_bytes = None
            clean_url = media_url.split("?")[0]
            filename = Path(clean_url).name

            # Check if file exists in local UPLOADS_DIR
            local_candidate = UPLOADS_DIR / filename
            if local_candidate.exists():
                img_bytes = local_candidate.read_bytes()
            elif media_url.startswith("http://") or media_url.startswith("https://"):
                try:
                    resp = await client.get(media_url, timeout=20.0)
                    if resp.status_code == 200:
                        img_bytes = resp.content
                except Exception as dl_err:
                    print(f"[InstagramPublisher] Failed to download remote media: {dl_err}")

            if not img_bytes:
                # If we cannot inspect, return original URL as fallback
                return media_url

            # 2. Open image and check aspect ratio
            with Image.open(io.BytesIO(img_bytes)) as orig:
                # Convert to RGB (handles RGBA / transparency with clean white background)
                if orig.mode in ("RGBA", "LA", "P"):
                    bg = Image.new("RGB", orig.size, (255, 255, 255))
                    if orig.mode == "P":
                        orig = orig.convert("RGBA")
                    mask = orig.split()[-1] if "A" in orig.mode else None
                    bg.paste(orig, mask=mask)
                    img = bg
                else:
                    img = orig.convert("RGB")

                w, h = img.size
                if w <= 0 or h <= 0:
                    return media_url

                ratio = w / h
                was_padded = False

                # Instagram accepts strictly 4:5 (0.80) to 1.91:1
                if ratio < 0.80:
                    # Too tall (e.g. 9:16 mobile screenshot or vertical portrait)
                    # Safe width with margin: 0.81 ratio (slightly above 0.80 to avoid Meta rounding issues)
                    new_w = int(math.ceil(h * 0.81))
                    padded = Image.new("RGB", (new_w, h), (255, 255, 255))
                    offset_x = (new_w - w) // 2
                    padded.paste(img, (offset_x, 0))
                    img = padded
                    was_padded = True
                    print(f"[InstagramPublisher] Image was too vertical ({w}x{h}, {ratio:.2f}). Padded to {new_w}x{h} (0.81 ratio).")

                elif ratio > 1.91:
                    # Too wide (e.g. banner or panorama)
                    # Safe height with margin: 1.90 ratio
                    new_h = int(math.ceil(w / 1.90))
                    padded = Image.new("RGB", (w, new_h), (255, 255, 255))
                    offset_y = (new_h - h) // 2
                    padded.paste(img, (0, offset_y))
                    img = padded
                    was_padded = True
                    print(f"[InstagramPublisher] Image was too wide ({w}x{h}, {ratio:.2f}). Padded to {w}x{new_h} (1.90 ratio).")

                # If the image was NOT padded and is already a public URL (not localhost), return it directly!
                is_local = not (media_url.startswith("http://") or media_url.startswith("https://")) or ("localhost" in media_url or "127.0.0.1" in media_url)
                if not was_padded and not is_local:
                    return media_url

                # Save padded/converted image locally to UPLOADS_DIR
                unique_name = f"ig_{uuid.uuid4().hex[:10]}.jpg"
                save_path = UPLOADS_DIR / unique_name
                img.save(save_path, "JPEG", quality=95)

            # 3. Host publicly: try FreeImage CDN first
            try:
                with open(save_path, "rb") as f:
                    up_resp = await client.post(
                        "https://freeimage.host/api/1/upload",
                        data={"key": "6d207e02198a847aa98d0a2a901485a5", "action": "upload", "format": "json"},
                        files={"source": ("image.jpg", f, "image/jpeg")},
                        timeout=20.0
                    )
                if up_resp.status_code == 200:
                    up_data = up_resp.json()
                    cdn_url = up_data.get("image", {}).get("url")
                    if cdn_url:
                        print(f"[InstagramPublisher] Uploaded compliant image to CDN: {cdn_url}")
                        return cdn_url
            except Exception as cdn_err:
                print(f"[InstagramPublisher] CDN upload warning: {cdn_err}")

            # Fallback 1: If original media_url came from a deployed host (e.g. onrender.com)
            if "onrender.com" in media_url:
                base_domain = media_url.split("/uploads/")[0]
                return f"{base_domain}/uploads/{unique_name}"

            # Fallback 2: If RENDER_EXTERNAL_URL environment variable is set
            render_url = os.environ.get("RENDER_EXTERNAL_URL")
            if render_url:
                return f"{render_url.rstrip('/')}/uploads/{unique_name}"

            return f"/uploads/{unique_name}"

        except Exception as err:
            print(f"[InstagramPublisher] Aspect ratio normalization error: {err}")
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
