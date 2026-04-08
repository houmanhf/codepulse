import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    resp = await client.post(
        "/api/auth/register",
        json={"email": "new@example.com", "username": "newuser", "password": "secret123"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["user"]["email"] == "new@example.com"
    assert data["user"]["username"] == "newuser"
    assert "access_token" in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    payload = {"email": "dup@example.com", "username": "user1", "password": "secret123"}
    await client.post("/api/auth/register", json=payload)
    resp = await client.post(
        "/api/auth/register",
        json={"email": "dup@example.com", "username": "user2", "password": "secret123"},
    )
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    await client.post(
        "/api/auth/register",
        json={"email": "login@example.com", "username": "loginuser", "password": "secret123"},
    )
    resp = await client.post(
        "/api/auth/login",
        json={"email": "login@example.com", "password": "secret123"},
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()
    assert resp.json()["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    await client.post(
        "/api/auth/register",
        json={"email": "wrong@example.com", "username": "wronguser", "password": "secret123"},
    )
    resp = await client.post(
        "/api/auth/login",
        json={"email": "wrong@example.com", "password": "badpassword"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me(client: AsyncClient, auth_headers: dict):
    resp = await client.get("/api/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "test@test.com"


@pytest.mark.asyncio
async def test_me_unauthorized(client: AsyncClient):
    resp = await client.get("/api/auth/me")
    assert resp.status_code in (401, 403)