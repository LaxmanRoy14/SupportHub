from sqlalchemy.orm import Session

from app.models import AgentCategory, Ticket, User


ACTIVE_TICKET_STATUSES = ("OPEN", "PENDING")


def _active_workload(db: Session, agent_id: int) -> int:
    return (
        db.query(Ticket)
        .filter(
            Ticket.assigned_to == agent_id,
            Ticket.status.in_(ACTIVE_TICKET_STATUSES),
        )
        .count()
    )


def select_agent_for_ticket(db: Session, category_id: int) -> int | None:
    eligible_agents = (
        db.query(User)
        .join(AgentCategory, AgentCategory.agent_id == User.id)
        .filter(
            User.role == "AGENT",
            AgentCategory.category_id == category_id,
        )
        .order_by(User.id)
        .all()
    )

    available_agents = [
        agent
        for agent in eligible_agents
        if agent.availability_status == "AVAILABLE"
    ]
    if available_agents:
        selected_agent = min(
            available_agents,
            key=lambda agent: (_active_workload(db, agent.id), agent.id),
        )
        return selected_agent.id

    fallback_agents = [agent for agent in eligible_agents if agent.available_at is not None]
    if fallback_agents:
        selected_agent = min(
            fallback_agents,
            key=lambda agent: (agent.available_at, agent.id),
        )
        return selected_agent.id

    return None
