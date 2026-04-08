import enum
import uuid
from datetime import datetime

from sqlalchemy import Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class SnippetStatus(str, enum.Enum):
    pending = "pending"
    in_review = "in_review"
    approved = "approved"
    changes_requested = "changes_requested"


class Snippet(Base):
    __tablename__ = "snippets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255))
    code: Mapped[str] = mapped_column(Text)
    language: Mapped[str] = mapped_column(String(50))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[SnippetStatus] = mapped_column(
        Enum(SnippetStatus), default=SnippetStatus.pending, server_default="pending"
    )
    author_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    author = relationship("User", back_populates="snippets", lazy="joined")
    reviews = relationship("Review", back_populates="snippet", lazy="selectin", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="snippet", lazy="selectin", cascade="all, delete-orphan")