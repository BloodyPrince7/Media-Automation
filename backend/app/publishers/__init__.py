from app.publishers.base import BasePublisher, ValidationResult, PublishResult
from app.publishers.twitter_publisher import TwitterPublisher
from app.publishers.linkedin_publisher import LinkedInPublisher

twitter_publisher = TwitterPublisher()
linkedin_publisher = LinkedInPublisher()

def get_publisher(platform: str) -> BasePublisher:
    p = platform.lower()
    if p in ["x", "twitter"]:
        return twitter_publisher
    elif p == "linkedin":
        return linkedin_publisher
    else:
        raise ValueError(f"Unknown publisher platform: {platform}")
