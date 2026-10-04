import asyncio
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Post, PublishLog
from app.config import settings
from app.publishers import get_publisher

scheduler = AsyncIOScheduler()

async def execute_post_publication(post_id: int):
    """Core logic to publish a post to its target platforms."""
    db: Session = SessionLocal()
    try:
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            return

        post.status = "PUBLISHING"
        db.commit()

        success_count = 0
        failure_count = 0
        platforms = post.target_platforms or ["x", "linkedin"]

        for platform in platforms:
            try:
                publisher = get_publisher(platform)
                if platform == "x" and post.x_content:
                    content = post.x_content
                elif platform == "linkedin" and post.linkedin_content:
                    content = post.linkedin_content
                elif platform in ["instagram", "ig"] and post.instagram_content:
                    content = post.instagram_content
                else:
                    content = post.content

                result = await publisher.publish(
                    text=content,
                    media_urls=post.media_urls
                )

                # Record log
                log = PublishLog(
                    post_id=post.id,
                    platform=platform,
                    status="SUCCESS" if result.success else "FAILED",
                    platform_post_id=result.platform_post_id,
                    post_url=result.post_url,
                    error_message=result.error_message
                )
                db.add(log)

                if result.success:
                    success_count += 1
                else:
                    failure_count += 1

            except Exception as e:
                failure_count += 1
                db.add(PublishLog(
                    post_id=post.id,
                    platform=platform,
                    status="FAILED",
                    error_message=str(e)
                ))

        # Update final post status
        if failure_count == 0 and success_count > 0:
            post.status = "PUBLISHED"
            post.published_at = datetime.now(timezone.utc)
        elif success_count > 0 and failure_count > 0:
            post.status = "PARTIALLY_PUBLISHED"
            post.published_at = datetime.now(timezone.utc)
        else:
            post.status = "FAILED"

        db.commit()

    except Exception as e:
        print(f"Error publishing post {post_id}: {e}")
        db.rollback()
    finally:
        db.close()


async def check_and_publish_scheduled():
    """Periodic task that finds scheduled posts that are due."""
    db: Session = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        # Find scheduled posts where scheduled_at <= now
        due_posts = db.query(Post).filter(
            Post.status == "SCHEDULED",
            Post.scheduled_at <= now
        ).all()

        post_ids = [p.id for p in due_posts]
        db.close()

        for pid in post_ids:
            await execute_post_publication(pid)

    except Exception as e:
        print(f"Scheduler check error: {e}")
        db.close()

def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(check_and_publish_scheduled, "interval", seconds=15, id="check_scheduled_posts")
        scheduler.start()

def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown()
