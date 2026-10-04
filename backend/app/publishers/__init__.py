from app.publishers.base import BasePublisher, ValidationResult, PublishResult
from app.publishers.twitter_publisher import TwitterPublisher
from app.publishers.linkedin_publisher import LinkedInPublisher
from app.publishers.instagram_publisher import InstagramPublisher

twitter_publisher = TwitterPublisher()
linkedin_publisher = LinkedInPublisher()
instagram_publisher = InstagramPublisher()

def get_publisher(platform: str) -> BasePublisher:
    p = platform.lower()
    if p in ["x", "twitter"]:
        return twitter_publisher
    elif p == "linkedin":
        return linkedin_publisher
    elif p in ["instagram", "ig"]:
        return instagram_publisher
    else:
        raise ValueError(f"Unknown publisher platform: {platform}")
