from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.user import UserResponse


class CommentCreate(BaseModel):
    line_number: int
    body: str


class CommentResponse(BaseModel):
    id: UUID
    snippet_id: UUID
    author_id: UUID
    author: UserResponse
    review_id: UUID | None
    line_number: int
    body: str
    created_at: datetime

    model_config = {"from_attributes": True}