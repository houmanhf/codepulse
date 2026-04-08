import pytest
from httpx import AsyncClient

SNIPPET_PAYLOAD = {
    "title": "Hello World",
    "code": "print('hello')",
    "language": "python",
    "description": "A simple snippet",
}


async def create_snippet(client: AsyncClient, headers: dict, **overrides) -> dict:
    payload = {**SNIPPET_PAYLOAD, **overrides}
    resp = await client.post("/api/snippets", json=payload, headers=headers)
    return resp.json()


@pytest.mark.asyncio
async def test_create_snippet(client: AsyncClient, auth_headers: dict):
    resp = await client.post("/api/snippets", json=SNIPPET_PAYLOAD, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Hello World"
    assert data["status"] == "pending"
    assert data["author"]["username"] == "testuser"


@pytest.mark.asyncio
async def test_create_snippet_unauthorized(client: AsyncClient):
    resp = await client.post("/api/snippets", json=SNIPPET_PAYLOAD)
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_list_snippets(client: AsyncClient, auth_headers: dict):
    await create_snippet(client, auth_headers, title="First")
    await create_snippet(client, auth_headers, title="Second")
    resp = await client.get("/api/snippets")
    assert resp.status_code == 200
    assert len(resp.json()["snippets"]) >= 2


@pytest.mark.asyncio
async def test_get_snippet(client: AsyncClient, auth_headers: dict):
    created = await create_snippet(client, auth_headers)
    resp = await client.get(f"/api/snippets/{created['id']}")
    assert resp.status_code == 200
    assert resp.json()["title"] == "Hello World"


@pytest.mark.asyncio
async def test_get_snippet_not_found(client: AsyncClient):
    resp = await client.get("/api/snippets/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_snippet(client: AsyncClient, auth_headers: dict):
    created = await create_snippet(client, auth_headers)
    resp = await client.put(
        f"/api/snippets/{created['id']}",
        json={"title": "Updated"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated"


@pytest.mark.asyncio
async def test_update_snippet_forbidden(
    client: AsyncClient, auth_headers: dict, second_user_headers: dict
):
    created = await create_snippet(client, auth_headers)
    resp = await client.put(
        f"/api/snippets/{created['id']}",
        json={"title": "Hacked"},
        headers=second_user_headers,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_delete_snippet(client: AsyncClient, auth_headers: dict):
    created = await create_snippet(client, auth_headers)
    resp = await client.delete(f"/api/snippets/{created['id']}", headers=auth_headers)
    assert resp.status_code == 204

    resp = await client.get(f"/api/snippets/{created['id']}")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_review(
    client: AsyncClient, auth_headers: dict, second_user_headers: dict
):
    created = await create_snippet(client, auth_headers)
    resp = await client.post(
        f"/api/snippets/{created['id']}/reviews",
        json={"status": "approved", "body": "Looks good"},
        headers=second_user_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["status"] == "approved"


@pytest.mark.asyncio
async def test_cannot_review_own_snippet(client: AsyncClient, auth_headers: dict):
    created = await create_snippet(client, auth_headers)
    resp = await client.post(
        f"/api/snippets/{created['id']}/reviews",
        json={"status": "approved"},
        headers=auth_headers,
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_list_reviews(
    client: AsyncClient, auth_headers: dict, second_user_headers: dict
):
    created = await create_snippet(client, auth_headers)
    await client.post(
        f"/api/snippets/{created['id']}/reviews",
        json={"status": "changes_requested", "body": "Fix line 3"},
        headers=second_user_headers,
    )
    resp = await client.get(f"/api/snippets/{created['id']}/reviews")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


@pytest.mark.asyncio
async def test_create_comment(client: AsyncClient, auth_headers: dict):
    created = await create_snippet(client, auth_headers)
    resp = await client.post(
        f"/api/snippets/{created['id']}/comments",
        json={"line_number": 1, "body": "Use f-string here"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["line_number"] == 1


@pytest.mark.asyncio
async def test_list_comments(client: AsyncClient, auth_headers: dict):
    created = await create_snippet(client, auth_headers)
    await client.post(
        f"/api/snippets/{created['id']}/comments",
        json={"line_number": 1, "body": "First comment"},
        headers=auth_headers,
    )
    await client.post(
        f"/api/snippets/{created['id']}/comments",
        json={"line_number": 5, "body": "Second comment"},
        headers=auth_headers,
    )
    resp = await client.get(f"/api/snippets/{created['id']}/comments")
    assert resp.status_code == 200
    assert len(resp.json()) == 2