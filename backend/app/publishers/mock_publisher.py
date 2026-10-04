import random
import time
from app.publishers.base import PublishResult

def simulate_publish(platform: str, text: str) -> PublishResult:
    # Generate realistic pseudo-ID
    timestamp = int(time.time() * 1000)
    rand_suffix = random.randint(1000, 9999)

    if platform.lower() == "x":
        tweet_id = f"184{timestamp % 1000000000}{rand_suffix}"
        return PublishResult(
            success=True,
            platform="x",
            platform_post_id=tweet_id,
            post_url=f"https://x.com/creator/status/{tweet_id}"
        )
    elif platform.lower() == "linkedin":
        activity_id = f"724{timestamp % 1000000000}{rand_suffix}"
        urn = f"urn:li:activity:{activity_id}"
        return PublishResult(
            success=True,
            platform="linkedin",
            platform_post_id=urn,
            post_url=f"https://www.linkedin.com/feed/update/{urn}/"
        )
    else:
        return PublishResult(
            success=False,
            platform=platform,
            error_message=f"Unsupported platform: {platform}"
        )
