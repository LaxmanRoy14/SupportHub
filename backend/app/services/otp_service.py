import secrets
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models import OTPVerification, User
from app.utils.security import hash_password, verify_password


def generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def create_otp(
    db: Session,
    user_id: int
) -> str:

    otp = generate_otp()

    otp_hash = hash_password(otp)

    expires_at = datetime.utcnow() + timedelta(minutes=10)

    otp_record = OTPVerification(
        user_id=user_id,
        otp_hash=otp_hash,
        expires_at=expires_at
    )

    db.add(otp_record)
    db.commit()

    return otp


def verify_otp(
    db: Session,
    user_id: int,
    entered_otp: str
) -> bool:

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        return False

    otp_record = (
        db.query(OTPVerification)
        .filter(
            OTPVerification.user_id == user_id
        )
        .order_by(
            OTPVerification.created_at.desc()
        )
        .first()
    )

    if not otp_record:
        return False

    if datetime.utcnow() > otp_record.expires_at:
        return False

    if not verify_password(
        entered_otp,
        otp_record.otp_hash
    ):
        return False

    user.is_verified = True

    db.commit()

    return True