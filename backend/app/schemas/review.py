from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.review import ReviewStatus
from app.schemas.user import UserResponse


class ReviewCreate(BaseModel):
    status: ReviewStatus
    body: str | None = None


class ReviewResponse(BaseModel):
    id: UUID
    snippet_id: UUID
    reviewer_id: UUID
    reviewer: UserResponse
    status: ReviewStatus
    body: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
