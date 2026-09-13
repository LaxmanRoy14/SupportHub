from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token
)


def register_user(
    db: Session,
    data: RegisterRequest
) -> User:

    existing_user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_user:
        raise ValueError("Email is already registered")

    hashed_password = hash_password(data.password)

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hashed_password,
        is_verified=False,
        role="CUSTOMER",
        availability_status="OFFLINE"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def login_user(
    db: Session,
    email: str,
    password: str
) -> str:

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise ValueError(
            "Invalid email or password"
        )

    if not user.is_verified:
        raise ValueError(
            "Email is not verified"
        )

    if not verify_password(
        password,
        user.password_hash
    ):
        raise ValueError(
            "Invalid email or password"
        )

    access_token = create_access_token(
        user_id=user.id,
        role=user.role
    )

    return access_token