from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.snippet import Snippet
from app.schemas.snippet import SnippetCreate, SnippetUpdate


async def list_snippets(db: AsyncSession) -> list[Snippet]:
    result = await db.execute(
        select(Snippet).options(joinedload(Snippet.author)).order_by(Snippet.created_at.desc())
    )
    return list(result.scalars().unique())


async def get_snippet(db: AsyncSession, snippet_id: UUID) -> Snippet | None:
    result = await db.execute(
        select(Snippet)
        .options(
            joinedload(Snippet.author),
            joinedload(Snippet.reviews),
            joinedload(Snippet.comments),
        )
        .where(Snippet.id == snippet_id)
    )
    return result.unique().scalar_one_or_none()


async def create_snippet(db: AsyncSession, data: SnippetCreate, author_id: UUID) -> Snippet:
    snippet = Snippet(**data.model_dump(), author_id=author_id)
    db.add(snippet)
    await db.commit()
    await db.refresh(snippet, ["author"])
    return snippet


async def update_snippet(db: AsyncSession, snippet: Snippet, data: SnippetUpdate) -> Snippet:
    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(snippet, field, value)
    await db.commit()
    await db.refresh(snippet)
    await db.refresh(snippet, ["author"])
    return snippet


async def delete_snippet(db: AsyncSession, snippet: Snippet) -> None:
    await db.delete(snippet)
    await db.commit()