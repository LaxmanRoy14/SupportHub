from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from app.models import Category, Ticket, User
from app.schemas.dashboard import (
    AgentWorkload,
    CategoryTicketCount,
    DashboardAnalyticsResponse,
    PersonalAnalyticsResponse,
)


ACTIVE_TICKET_STATUSES = ("OPEN", "PENDING")


def get_dashboard_analytics(db: Session) -> DashboardAnalyticsResponse:
    total_tickets = db.query(func.count(Ticket.id)).scalar() or 0

    status_counts = {"OPEN": 0, "PENDING": 0, "RESOLVED": 0}
    for status, count in db.query(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status):
        status_counts[status] = count

    priority_counts = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
    for priority, count in db.query(Ticket.priority, func.count(Ticket.id)).group_by(Ticket.priority):
        priority_counts[priority] = count

    category_counts = [
        CategoryTicketCount(
            category_id=category_id,
            category_name=category_name,
            ticket_count=ticket_count,
        )
        for category_id, category_name, ticket_count in (
            db.query(Category.id, Category.name, func.count(Ticket.id))
            .outerjoin(Ticket, Ticket.category_id == Category.id)
            .group_by(Category.id, Category.name)
            .order_by(Category.id)
            .all()
        )
    ]

    availability_counts = {"AVAILABLE": 0, "BUSY": 0, "OFFLINE": 0}
    for availability_status, count in (
        db.query(User.availability_status, func.count(User.id))
        .filter(User.role == "AGENT")
        .group_by(User.availability_status)
        .all()
    ):
        availability_counts[availability_status] = count

    agent_workloads = [
        AgentWorkload(
            agent_id=agent_id,
            agent_name=agent_name,
            active_ticket_count=active_ticket_count,
        )
        for agent_id, agent_name, active_ticket_count in (
            db.query(User.id, User.name, func.count(Ticket.id))
            .outerjoin(
                Ticket,
                and_(
                    Ticket.assigned_to == User.id,
                    Ticket.status.in_(ACTIVE_TICKET_STATUSES),
                ),
            )
            .filter(User.role == "AGENT")
            .group_by(User.id, User.name)
            .order_by(User.id)
            .all()
        )
    ]

    return DashboardAnalyticsResponse(
        total_tickets=total_tickets,
        open_tickets=status_counts["OPEN"],
        pending_tickets=status_counts["PENDING"],
        resolved_tickets=status_counts["RESOLVED"],
        resolution_rate=(status_counts["RESOLVED"] / total_tickets * 100) if total_tickets else 0.0,
        tickets_by_priority=priority_counts,
        tickets_by_category=category_counts,
        agent_availability_counts=availability_counts,
        agent_workloads=agent_workloads,
    )


def get_personal_analytics(db: Session, agent_id: int) -> PersonalAnalyticsResponse:
    assigned = db.query(Ticket).filter(Ticket.assigned_to == agent_id)
    total_tickets = assigned.count()

    status_counts = {"OPEN": 0, "PENDING": 0, "RESOLVED": 0}
    for status, count in assigned.with_entities(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status):
        status_counts[status] = count

    priority_counts = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
    for priority, count in assigned.with_entities(Ticket.priority, func.count(Ticket.id)).group_by(Ticket.priority):
        priority_counts[priority] = count

    category_counts = [
        CategoryTicketCount(category_id=category_id, category_name=category_name, ticket_count=ticket_count)
        for category_id, category_name, ticket_count in (
            db.query(Category.id, Category.name, func.count(Ticket.id))
            .join(Ticket, Ticket.category_id == Category.id)
            .filter(Ticket.assigned_to == agent_id)
            .group_by(Category.id, Category.name)
            .order_by(Category.id)
            .all()
        )
    ]

    return PersonalAnalyticsResponse(
        total_assigned_tickets=total_tickets,
        open_tickets=status_counts["OPEN"],
        pending_tickets=status_counts["PENDING"],
        resolved_tickets=status_counts["RESOLVED"],
        resolution_rate=(status_counts["RESOLVED"] / total_tickets * 100) if total_tickets else 0.0,
        tickets_by_priority=priority_counts,
        tickets_by_category=category_counts,
        active_workload=status_counts["OPEN"] + status_counts["PENDING"],
    )
