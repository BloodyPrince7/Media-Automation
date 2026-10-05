import hashlib
import os
import secrets
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models import User

def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """Hashes a password using PBKDF2 HMAC SHA-256 with a secure salt."""
    if not salt:
        salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100_000
    ).hex()
    return pw_hash, salt

def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    """Verifies a password against stored PBKDF2 hash."""
    calc_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(calc_hash, stored_hash)

def generate_session_token() -> str:
    """Generates a secure cryptographically random session token."""
    return secrets.token_urlsafe(32)

def seed_demo_user_if_needed(db: Session):
    """Ensures at least one primary admin/creator user exists for instant 1-click test."""
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            pw_hash, salt = hash_password("password123")
            demo_user = User(
                username="pankaj",
                email="pankaj@socialpulse.studio",
                full_name="Pankaj Kumar",
                password_hash=pw_hash,
                salt=salt,
                role="ADMIN",
                avatar_color="#6a6afe",
                session_token=generate_session_token()
            )
            db.add(demo_user)
            db.commit()
            print("INFO: Initial demo user 'pankaj' created successfully.")
    except Exception as e:
        db.rollback()
        print(f"WARN: Failed to seed demo user: {e}")
