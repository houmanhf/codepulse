import enum
import uuid
from datetime import datetime

from sqlalchemy import Enum, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class ReviewStatus(str, enum.Enum):
    approved = "approved"
    changes_requested = "changes_requested"


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    snippet_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("snippets.id"))
    reviewer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    status: Mapped[ReviewStatus] = mapped_column(Enum(ReviewStatus))
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    snippet = relationship("Snippet", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews", lazy="joined")
    comments = relationship("Comment", back_populates="review", lazy="selectin")