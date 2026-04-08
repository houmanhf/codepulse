"""Edge-case tests for snippets and reviews API."""

import pytest
from httpx import AsyncClient


SNIPPET_PAYLOAD = {
    "title": "Edge Test",
    "code": "x = 1",
    "language": "python",
}


async def _create_snippet(client: AsyncClient, headers: dict, **overrides) -> dict:
    payload = {**SNIPPET_PAYLOAD, **overrides}
    resp = await client.post("/api/snippets", json=payload, headers=headers)
    return resp.json()


@pytest.mark.asyncio
async def test_create_snippet_missing_fields(client: AsyncClient, auth_headers: dict):
    resp = await client.post(
        "/api/snippets", json={"title": "No code"}, headers=auth_headers
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_update_nonexistent_snippet(client: AsyncClient, auth_headers: dict):
    resp = await client.put(
        "/api/snippets/00000000-0000-0000-0000-000000000000",
        json={"title": "Ghost"},
        headers=auth_headers,
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_nonexistent_snippet(client: AsyncClient, auth_headers: dict):
    resp = await client.delete(
        "/api/snippets/00000000-0000-0000-0000-000000000000",
        headers=auth_headers,
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_forbidden(
    client: AsyncClient, auth_headers: dict, second_user_headers: dict
):
    created = await _create_snippet(client, auth_headers)
    resp = await client.delete(
        f"/api/snippets/{created['id']}", headers=second_user_headers
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_review_nonexistent_snippet(client: AsyncClient, auth_headers: dict):
    resp = await client.post(
        "/api/snippets/00000000-0000-0000-0000-000000000000/reviews",
        json={"status": "approved"},
        headers=auth_headers,
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_comment_nonexistent_snippet(client: AsyncClient, auth_headers: dict):
    resp = await client.post(
        "/api/snippets/00000000-0000-0000-0000-000000000000/comments",
        json={"line_number": 1, "body": "Ghost comment"},
        headers=auth_headers,
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_reviews_empty(client: AsyncClient, auth_headers: dict):
    created = await _create_snippet(client, auth_headers)
    resp = await client.get(f"/api/snippets/{created['id']}/reviews")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_get_comments_empty(client: AsyncClient, auth_headers: dict):
    created = await _create_snippet(client, auth_headers)
    resp = await client.get(f"/api/snippets/{created['id']}/comments")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_review_changes_snippet_status_to_approved(
    client: AsyncClient, auth_headers: dict, second_user_headers: dict
):
    created = await _create_snippet(client, auth_headers)
    assert created["status"] == "pending"

    await client.post(
        f"/api/snippets/{created['id']}/reviews",
        json={"status": "approved", "body": "LGTM"},
        headers=second_user_headers,
    )

    resp = await client.get(f"/api/snippets/{created['id']}")
    assert resp.json()["status"] == "approved"


@pytest.mark.asyncio
async def test_review_changes_snippet_status_to_changes_requested(
    client: AsyncClient, auth_headers: dict, second_user_headers: dict
):
    created = await _create_snippet(client, auth_headers)

    await client.post(
        f"/api/snippets/{created['id']}/reviews",
        json={"status": "changes_requested", "body": "Fix it"},
        headers=second_user_headers,
    )

    resp = await client.get(f"/api/snippets/{created['id']}")
    assert resp.json()["status"] == "changes_requested"


@pytest.mark.asyncio
async def test_update_snippet_partial_fields(client: AsyncClient, auth_headers: dict):
    created = await _create_snippet(client, auth_headers, title="Original", language="python")

    resp = await client.put(
        f"/api/snippets/{created['id']}",
        json={"title": "Updated Only Title"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Updated Only Title"
    assert data["language"] == "python"


@pytest.mark.asyncio
async def test_snippet_detail_includes_counts(
    client: AsyncClient, auth_headers: dict, second_user_headers: dict
):
    created = await _create_snippet(client, auth_headers)

    await client.post(
        f"/api/snippets/{created['id']}/comments",
        json={"line_number": 1, "body": "Comment 1"},
        headers=auth_headers,
    )
    await client.post(
        f"/api/snippets/{created['id']}/comments",
        json={"line_number": 2, "body": "Comment 2"},
        headers=second_user_headers,
    )
    await client.post(
        f"/api/snippets/{created['id']}/reviews",
        json={"status": "approved"},
        headers=second_user_headers,
    )

    resp = await client.get(f"/api/snippets/{created['id']}")
    detail = resp.json()
    assert detail["review_count"] == 1
    assert detail["comment_count"] == 2


@pytest.mark.asyncio
async def test_invalid_review_status(
    client: AsyncClient, auth_headers: dict, second_user_headers: dict
):
    created = await _create_snippet(client, auth_headers)
    resp = await client.post(
        f"/api/snippets/{created['id']}/reviews",
        json={"status": "invalid"},
        headers=second_user_headers,
    )
    assert resp.status_code == 422