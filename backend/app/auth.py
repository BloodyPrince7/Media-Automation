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
