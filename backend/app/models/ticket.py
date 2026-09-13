from datetime import datetime

from sqlalchemy import (
    ForeignKey,
    String,
    Text,
    DateTime,
    Enum
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id"),
        nullable=False,
        index=True
    )

    priority: Mapped[str] = mapped_column(
        Enum("LOW", "MEDIUM", "HIGH"),
        nullable=False,
        default="MEDIUM"
    )

    status: Mapped[str] = mapped_column(
        Enum("OPEN", "PENDING", "RESOLVED"),
        nullable=False,
        default="OPEN"
    )

    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    assigned_to: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    assigned_agent: Mapped["User | None"] = relationship("User", foreign_keys=[assigned_to])
