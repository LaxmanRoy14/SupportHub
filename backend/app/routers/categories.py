from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models import Category, User


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


DEFAULT_CATEGORIES = ["ACCOUNT", "TECHNICAL", "BILLING", "PAYMENT", "GENERAL"]

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("", response_model=list[CategoryResponse])
def list_categories_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    categories = db.query(Category).order_by(Category.id.asc()).all()
    if not categories:
        for cat_name in DEFAULT_CATEGORIES:
            db.add(Category(name=cat_name))
        db.commit()
        categories = db.query(Category).order_by(Category.id.asc()).all()
    return categories
