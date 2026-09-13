from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_role
from app.models import User
from app.schemas.dashboard import DashboardAnalyticsResponse, PersonalAnalyticsResponse
from app.services.dashboard_service import get_dashboard_analytics, get_personal_analytics


router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/analytics", response_model=DashboardAnalyticsResponse)
def get_dashboard_analytics_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("AGENT")),
):
    return get_dashboard_analytics(db)


@router.get("/my-analytics", response_model=PersonalAnalyticsResponse)
def get_my_dashboard_analytics_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("AGENT")),
):
    return get_personal_analytics(db, current_user.id)
