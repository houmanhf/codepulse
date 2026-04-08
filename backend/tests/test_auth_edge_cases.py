"""Edge-case tests for the auth API."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_duplicate_username(client: AsyncClient):
    await client.post(
        "/api/auth/register",
        json={"email": "u1@test.com", "username": "samename", "password": "pass123"},
    )
    resp = await client.post(
        "/api/auth/register",
        json={"email": "u2@test.com", "username": "samename", "password": "pass123"},
    )
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_login_nonexistent_email(client: AsyncClient):
    resp = await client.post(
        "/api/auth/login",
        json={"email": "nobody@test.com", "password": "pass123"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_with_invalid_token(client: AsyncClient):
    headers = {"Authorization": "Bearer invalid.jwt.token"}
    resp = await client.get("/api/auth/me", headers=headers)
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_register_returns_valid_token(client: AsyncClient):
    resp = await client.post(
        "/api/auth/register",
        json={"email": "tokencheck@test.com", "username": "tokenuser", "password": "pass123"},
    )
    assert resp.status_code == 201
    token = resp.json()["access_token"]

    me_resp = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "tokencheck@test.com"


@pytest.mark.asyncio
async def test_register_missing_fields(client: AsyncClient):
    resp = await client.post("/api/auth/register", json={"email": "a@b.com"})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_login_missing_fields(client: AsyncClient):
    resp = await client.post("/api/auth/login", json={})
    assert resp.status_code == 422