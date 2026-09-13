from sqlalchemy.orm import Session

from app.models import Comment, User
from app.schemas.comment import CommentCreate
from app.services.ticket_service import get_ticket


def list_comments(
    db: Session,
    ticket_id: int,
    current_user: User,
) -> list[Comment]:
    get_ticket(db, ticket_id, current_user)

    return (
        db.query(Comment)
        .filter(Comment.ticket_id == ticket_id)
        .order_by(Comment.created_at.asc(), Comment.id.asc())
        .all()
    )


def create_comment(
    db: Session,
    ticket_id: int,
    data: CommentCreate,
    current_user: User,
) -> Comment:
    get_ticket(db, ticket_id, current_user)

    comment = Comment(
        ticket_id=ticket_id,
        user_id=current_user.id,
        message=data.message,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
