from pydantic import BaseModel


class CategoryTicketCount(BaseModel):
    category_id: int
    category_name: str
    ticket_count: int


class AgentWorkload(BaseModel):
    agent_id: int
    agent_name: str
    active_ticket_count: int


class DashboardAnalyticsResponse(BaseModel):
    total_tickets: int
    open_tickets: int
    pending_tickets: int
    resolved_tickets: int
    resolution_rate: float
    tickets_by_priority: dict[str, int]
    tickets_by_category: list[CategoryTicketCount]
    agent_availability_counts: dict[str, int]
    agent_workloads: list[AgentWorkload]


class PersonalAnalyticsResponse(BaseModel):
    total_assigned_tickets: int
    open_tickets: int
    pending_tickets: int
    resolved_tickets: int
    resolution_rate: float
    tickets_by_priority: dict[str, int]
    tickets_by_category: list[CategoryTicketCount]
    active_workload: int
