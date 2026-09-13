from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas.auth import (
    RegisterRequest,
    VerifyOTPRequest,
    ResendOTPRequest,
    LoginRequest
)
from app.services.auth_service import (
    register_user,
    login_user
)
from app.services.otp_service import (
    create_otp,
    verify_otp
)
from app.utils.email import send_otp_email

from app.dependencies.auth import (
    get_current_user,
    require_role
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    try:
        user = register_user(db, data)

        otp = create_otp(db, user.id)

        send_otp_email(
            user.email,
            otp
        )

        return {
            "message": "Registration successful. OTP sent to your email.",
            "user_id": user.id
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

@router.post("/verify-otp")
def verify_otp_endpoint(
    data: VerifyOTPRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid email or OTP"
        )

    if user.is_verified:
        raise HTTPException(
            status_code=400,
            detail="Email is already verified"
        )

    is_valid = verify_otp(
        db,
        user.id,
        data.otp
    )

    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP"
        )

    return {
        "message": "Email verified successfully."
    }

@router.post("/resend-otp")
def resend_otp(
    data: ResendOTPRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=400,
            detail="User not found"
        )

    if user.is_verified:
        raise HTTPException(
            status_code=400,
            detail="Email is already verified"
        )

    otp = create_otp(
        db,
        user.id
    )

    send_otp_email(
        user.email,
        otp
    )

    return {
        "message": "A new OTP has been sent to your email."
    }

@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    try:
        access_token = login_user(
            db,
            data.email,
            data.password
        )

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    except ValueError as error:
        raise HTTPException(
            status_code=401,
            detail=str(error)
        )

@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "is_verified": current_user.is_verified
    }