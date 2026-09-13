from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Category, Ticket, User
from app.schemas.ticket import TicketCreate, TicketUpdate
from app.services.assignment_service import select_agent_for_ticket


VALID_STATUS_TRANSITIONS = {
    "OPEN": {"PENDING"},
    "PENDING": {"RESOLVED"},
    "RESOLVED": {"OPEN"},
}


def _get_category_or_raise(db: Session, category_id: int) -> Category:
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")
    return category


def _get_ticket_or_raise(db: Session, ticket_id: int) -> Ticket:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


def _ensure_ticket_access(db: Session, ticket: Ticket, current_user: User) -> None:
    if current_user.role == "CUSTOMER":
        if ticket.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="You do not have access to this ticket")
        return

    if current_user.role == "AGENT":
        if ticket.assigned_to == current_user.id:
            return

    raise HTTPException(status_code=403, detail="You do not have access to this ticket")


def _ensure_customer(current_user: User) -> None:
    if current_user.role != "CUSTOMER":
        raise HTTPException(status_code=403, detail="Only customers can modify tickets")


def create_ticket(db: Session, data: TicketCreate, current_user: User) -> Ticket:
    _ensure_customer(current_user)
    _get_category_or_raise(db, data.category_id)

    assigned_to = select_agent_for_ticket(db, data.category_id)

    ticket = Ticket(
        title=data.title,
        description=data.description,
        category_id=data.category_id,
        priority=data.priority,
        status="OPEN",
        created_by=current_user.id,
        assigned_to=assigned_to,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def list_tickets(db: Session, current_user: User) -> list[Ticket]:
    query = db.query(Ticket)

    if current_user.role == "CUSTOMER":
        query = query.filter(Ticket.created_by == current_user.id)
    elif current_user.role == "AGENT":
        query = query.filter(Ticket.assigned_to == current_user.id)
    else:
        raise HTTPException(status_code=403, detail="You do not have access to tickets")

    return query.order_by(Ticket.created_at.desc()).all()


def get_ticket(db: Session, ticket_id: int, current_user: User) -> Ticket:
    ticket = _get_ticket_or_raise(db, ticket_id)
    _ensure_ticket_access(db, ticket, current_user)
    return ticket


def update_ticket(
    db: Session,
    ticket_id: int,
    data: TicketUpdate,
    current_user: User,
) -> Ticket:
    ticket = _get_ticket_or_raise(db, ticket_id)
    _ensure_ticket_access(db, ticket, current_user)

    changes = data.model_dump(exclude_unset=True)
    new_status = changes.pop("status", None)

    if current_user.role == "CUSTOMER":
        if new_status is not None:
            raise HTTPException(
                status_code=403,
                detail="Customers cannot change ticket status",
            )

        if "category_id" in changes:
            _get_category_or_raise(db, changes["category_id"])

        for field, value in changes.items():
            setattr(ticket, field, value)

    elif current_user.role == "AGENT":
        if changes or new_status is None:
            raise HTTPException(
                status_code=403,
                detail="Agents can only change ticket status",
            )

        if new_status != ticket.status and new_status not in VALID_STATUS_TRANSITIONS[ticket.status]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status transition from {ticket.status} to {new_status}",
            )

        if new_status != ticket.status:
            ticket.status = new_status
            ticket.resolved_at = datetime.utcnow() if new_status == "RESOLVED" else None

    else:
        raise HTTPException(status_code=403, detail="You do not have permission to update tickets")

    db.commit()
    db.refresh(ticket)
    return ticket


def delete_ticket(db: Session, ticket_id: int, current_user: User) -> None:
    _ensure_customer(current_user)
    ticket = _get_ticket_or_raise(db, ticket_id)
    _ensure_ticket_access(db, ticket, current_user)

    db.delete(ticket)
    db.commit()
