from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


TicketPriority = Literal["LOW", "MEDIUM", "HIGH"]
TicketStatus = Literal["OPEN", "PENDING", "RESOLVED"]


class TicketCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    category_id: int = Field(gt=0)
    priority: TicketPriority = "MEDIUM"


class TicketUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, min_length=1)
    category_id: int | None = Field(default=None, gt=0)
    priority: TicketPriority | None = None
    status: TicketStatus | None = None


class AssignedAgent(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    role: str


class TicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    category_id: int
    priority: TicketPriority
    status: TicketStatus
    created_by: int
    assigned_to: int | None
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None
    assigned_agent: AssignedAgent | None = None
