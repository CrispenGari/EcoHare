import enum
import hashlib
import secrets
import uuid
from datetime import datetime, timezone

from constants import PASSWORD_PATTERN, UFH_EMAIL_PATTERN
from sqlalchemy import Enum as SAEnum


def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)

def enum_column(enum_class: type[enum.Enum], name: str) -> SAEnum:
    return SAEnum(
        enum_class,
        name=name,
        native_enum=False,
        create_constraint=True,
        validate_strings=True,
        values_callable=lambda values: [item.value for item in values],
    )

def is_valid_ufh_email(email: str) -> bool:
    """
    Check whether an email belongs exactly to the ufh.ac.za domain.
    """
    if not isinstance(email, str):
        return False
    email = email.strip()
    return UFH_EMAIL_PATTERN.fullmatch(email) is not None


def is_valid_password(password: str) -> bool:
    """
    Password requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    """
    if not isinstance(password, str):
        return False
    return PASSWORD_PATTERN.fullmatch(password) is not None


def create_public_reference() -> str:
    year = datetime.now(timezone.utc).year
    suffix = uuid.uuid4().hex[:10].upper()
    return f"ECO-{year}-{suffix}"


def create_tracking_token() -> tuple[str, str]:
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()
    return raw_token, token_hash