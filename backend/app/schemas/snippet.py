from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, computed_field

from app.models.snippet import SnippetStatus
from app.schemas.comment import CommentResponse
from app.schemas.review import ReviewResponse
from app.schemas.user import UserResponse


class SnippetCreate(BaseModel):
    title: str
    code: str
    language: str
    description: str | None = None


class SnippetUpdate(BaseModel):
    title: str | None = None
    code: str | None = None
    language: str | None = None
    description: str | None = None


class SnippetResponse(BaseModel):
    id: UUID
    title: str
    code: str
    language: str
    description: str | None
    status: SnippetStatus
    author_id: UUID
    author: UserResponse
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SnippetDetailResponse(SnippetResponse):
    reviews: list[ReviewResponse] = []
    comments: list[CommentResponse] = []

    @computed_field
    @property
    def review_count(self) -> int:
        return len(self.reviews)

    @computed_field
    @property
    def comment_count(self) -> int:
        return len(self.comments)


class SnippetListResponse(BaseModel):
    snippets: list[SnippetResponse]