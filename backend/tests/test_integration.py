"""
Full user flow integration tests.
Each test walks through a realistic multi-step scenario
rather than testing endpoints in isolation.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_full_review_flow(client: AsyncClient):
    """Register two users, one submits code, the other reviews it with comments."""

    # Alice registers and submits a snippet
    resp = await client.post(
        "/api/auth/register",
        json={"email": "alice@example.com", "username": "alice", "password": "pass1234"},
    )
    assert resp.status_code == 201
    alice_token = resp.json()["access_token"]
    alice_headers = {"Authorization": f"Bearer {alice_token}"}

    resp = await client.post(
        "/api/snippets",
        json={
            "title": "Binary search",
            "code": "def binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1",
            "language": "python",
            "description": "Classic binary search implementation",
        },
        headers=alice_headers,
    )
    assert resp.status_code == 201
    snippet_id = resp.json()["id"]
    assert resp.json()["status"] == "pending"
    assert resp.json()["author"]["username"] == "alice"

    # Bob registers and views the snippet
    resp = await client.post(
        "/api/auth/register",
        json={"email": "bob@example.com", "username": "bob", "password": "pass1234"},
    )
    bob_token = resp.json()["access_token"]
    bob_headers = {"Authorization": f"Bearer {bob_token}"}

    resp = await client.get(f"/api/snippets/{snippet_id}")
    assert resp.status_code == 200
    assert resp.json()["title"] == "Binary search"

    # Bob adds line comments
    resp = await client.post(
        f"/api/snippets/{snippet_id}/comments",
        json={"line_number": 4, "body": "Consider using (lo + hi) >> 1 to avoid overflow"},
        headers=bob_headers,
    )
    assert resp.status_code == 201

    resp = await client.post(
        f"/api/snippets/{snippet_id}/comments",
        json={"line_number": 10, "body": "Maybe raise ValueError instead of returning -1?"},
        headers=bob_headers,
    )
    assert resp.status_code == 201

    # Bob submits a review requesting changes
    resp = await client.post(
        f"/api/snippets/{snippet_id}/reviews",
        json={"status": "changes_requested", "body": "A couple of suggestions, see line comments."},
        headers=bob_headers,
    )
    assert resp.status_code == 201

    # Verify the snippet now has reviews and comments
    resp = await client.get(f"/api/snippets/{snippet_id}")
    detail = resp.json()
    assert detail["review_count"] == 1
    assert detail["comment_count"] == 2
    assert len(detail["reviews"]) == 1
    assert len(detail["comments"]) == 2
    assert detail["reviews"][0]["reviewer"]["username"] == "bob"
    assert detail["reviews"][0]["status"] == "changes_requested"

    # Verify comments are on the right lines
    comments_by_line = {c["line_number"]: c for c in detail["comments"]}
    assert 4 in comments_by_line
    assert 10 in comments_by_line
    assert comments_by_line[4]["author"]["username"] == "bob"

    # Alice updates her code based on feedback
    resp = await client.put(
        f"/api/snippets/{snippet_id}",
        json={"code": "def binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) >> 1\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    raise ValueError(f'{target} not found')"},
        headers=alice_headers,
    )
    assert resp.status_code == 200

    # Bob approves the updated code
    resp = await client.post(
        f"/api/snippets/{snippet_id}/reviews",
        json={"status": "approved", "body": "Looks good now."},
        headers=bob_headers,
    )
    assert resp.status_code == 201

    # Snippet should now show 2 reviews
    resp = await client.get(f"/api/snippets/{snippet_id}")
    assert resp.json()["review_count"] == 2


@pytest.mark.asyncio
async def test_multi_snippet_dashboard(client: AsyncClient):
    """Multiple users create snippets, verify listing shows everything correctly."""

    users = []
    for name in ["dev1", "dev2", "dev3"]:
        resp = await client.post(
            "/api/auth/register",
            json={"email": f"{name}@test.com", "username": name, "password": "password123"},
        )
        token = resp.json()["access_token"]
        users.append({"name": name, "headers": {"Authorization": f"Bearer {token}"}})

    # Each user creates a snippet in a different language
    languages = ["python", "javascript", "go"]
    snippet_ids = []
    for user, lang in zip(users, languages):
        resp = await client.post(
            "/api/snippets",
            json={"title": f"{lang.title()} example", "code": f"// {lang} code", "language": lang},
            headers=user["headers"],
        )
        assert resp.status_code == 201
        snippet_ids.append(resp.json()["id"])

    # List all snippets
    resp = await client.get("/api/snippets")
    snippets = resp.json()["snippets"]
    assert len(snippets) >= 3

    titles = {s["title"] for s in snippets}
    assert "Python example" in titles
    assert "Javascript example" in titles
    assert "Go example" in titles

    # Cross-review: dev2 reviews dev1's snippet
    resp = await client.post(
        f"/api/snippets/{snippet_ids[0]}/reviews",
        json={"status": "approved"},
        headers=users[1]["headers"],
    )
    assert resp.status_code == 201

    # dev3 reviews dev1's snippet too
    resp = await client.post(
        f"/api/snippets/{snippet_ids[0]}/reviews",
        json={"status": "approved", "body": "Clean code"},
        headers=users[2]["headers"],
    )
    assert resp.status_code == 201

    # Check dev1's snippet has 2 reviews
    resp = await client.get(f"/api/snippets/{snippet_ids[0]}")
    assert resp.json()["review_count"] == 2


@pytest.mark.asyncio
async def test_authorization_boundaries(client: AsyncClient):
    """Verify users can only modify their own snippets."""

    # Two users
    resp = await client.post(
        "/api/auth/register",
        json={"email": "owner@test.com", "username": "owner", "password": "pass1234"},
    )
    owner_headers = {"Authorization": f"Bearer {resp.json()['access_token']}"}

    resp = await client.post(
        "/api/auth/register",
        json={"email": "stranger@test.com", "username": "stranger", "password": "pass1234"},
    )
    stranger_headers = {"Authorization": f"Bearer {resp.json()['access_token']}"}

    # Owner creates a snippet
    resp = await client.post(
        "/api/snippets",
        json={"title": "My code", "code": "x = 1", "language": "python"},
        headers=owner_headers,
    )
    snippet_id = resp.json()["id"]

    # Stranger cannot update it
    resp = await client.put(
        f"/api/snippets/{snippet_id}",
        json={"title": "Hijacked"},
        headers=stranger_headers,
    )
    assert resp.status_code == 403

    # Stranger cannot delete it
    resp = await client.delete(f"/api/snippets/{snippet_id}", headers=stranger_headers)
    assert resp.status_code == 403

    # Stranger cannot review their own snippet
    resp = await client.post(
        "/api/snippets",
        json={"title": "Stranger code", "code": "y = 2", "language": "python"},
        headers=stranger_headers,
    )
    stranger_snippet_id = resp.json()["id"]
    resp = await client.post(
        f"/api/snippets/{stranger_snippet_id}/reviews",
        json={"status": "approved"},
        headers=stranger_headers,
    )
    assert resp.status_code == 400

    # Unauthenticated user cannot create anything
    resp = await client.post(
        "/api/snippets",
        json={"title": "Anon", "code": "z = 3", "language": "python"},
    )
    assert resp.status_code in (401, 403)

    # Owner can still delete their own
    resp = await client.delete(f"/api/snippets/{snippet_id}", headers=owner_headers)
    assert resp.status_code == 204
