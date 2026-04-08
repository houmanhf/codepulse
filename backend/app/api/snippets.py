from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.snippet import SnippetCreate, SnippetDetailResponse, SnippetListResponse, SnippetResponse, SnippetUpdate
from app.services.snippets import (
    create_snippet,
    delete_snippet,
    get_snippet,
    list_snippets,
    update_snippet,
)

router = APIRouter(prefix="/snippets", tags=["snippets"])


@router.get("", response_model=SnippetListResponse)
async def get_snippets(db: AsyncSession = Depends(get_db)):
    snippets = await list_snippets(db)
    return SnippetListResponse(snippets=snippets)


@router.post("", response_model=SnippetResponse, status_code=status.HTTP_201_CREATED)
async def create(
    data: SnippetCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    snippet = await create_snippet(db, data, current_user.id)
    return snippet


@router.get("/{snippet_id}", response_model=SnippetDetailResponse)
async def get_by_id(snippet_id: UUID, db: AsyncSession = Depends(get_db)):
    snippet = await get_snippet(db, snippet_id)
    if snippet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Snippet not found")
    return snippet


@router.put("/{snippet_id}", response_model=SnippetResponse)
async def update(
    snippet_id: UUID,
    data: SnippetUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    snippet = await get_snippet(db, snippet_id)
    if snippet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Snippet not found")
    if snippet.author_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your snippet")
    return await update_snippet(db, snippet, data)


@router.delete("/{snippet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(
    snippet_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    snippet = await get_snippet(db, snippet_id)
    if snippet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Snippet not found")
    if snippet.author_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your snippet")
    await delete_snippet(db, snippet)
