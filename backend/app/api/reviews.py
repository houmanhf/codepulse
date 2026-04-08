from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.deps import get_current_user, get_db
from app.models.comment import Comment
from app.models.review import Review
from app.models.snippet import Snippet, SnippetStatus
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/snippets/{snippet_id}", tags=["reviews", "comments"])


async def _get_snippet_or_404(db: AsyncSession, snippet_id: UUID) -> Snippet:
    snippet = await db.get(Snippet, snippet_id)
    if snippet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Snippet not found")
    return snippet


@router.post("/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    snippet_id: UUID,
    data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    snippet = await _get_snippet_or_404(db, snippet_id)
    if snippet.author_id == current_user.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot review your own snippet")

    review = Review(
        snippet_id=snippet_id,
        reviewer_id=current_user.id,
        status=data.status,
        body=data.body,
    )
    db.add(review)

    # update snippet status based on review
    if data.status.value == "approved":
        snippet.status = SnippetStatus.approved
    else:
        snippet.status = SnippetStatus.changes_requested

    await db.commit()
    await db.refresh(review, ["reviewer"])
    return review


@router.get("/reviews", response_model=list[ReviewResponse])
async def get_reviews(snippet_id: UUID, db: AsyncSession = Depends(get_db)):
    await _get_snippet_or_404(db, snippet_id)
    result = await db.execute(
        select(Review)
        .options(joinedload(Review.reviewer))
        .where(Review.snippet_id == snippet_id)
        .order_by(Review.created_at.desc())
    )
    return list(result.scalars().unique())


@router.post("/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    snippet_id: UUID,
    data: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_snippet_or_404(db, snippet_id)
    comment = Comment(
        snippet_id=snippet_id,
        author_id=current_user.id,
        line_number=data.line_number,
        body=data.body,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment, ["author"])
    return comment


@router.get("/comments", response_model=list[CommentResponse])
async def get_comments(snippet_id: UUID, db: AsyncSession = Depends(get_db)):
    await _get_snippet_or_404(db, snippet_id)
    result = await db.execute(
        select(Comment)
        .options(joinedload(Comment.author))
        .where(Comment.snippet_id == snippet_id)
        .order_by(Comment.line_number, Comment.created_at)
    )
    return list(result.scalars().unique())