import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_openapi_schema(client: AsyncClient):
    resp = await client.get("/openapi.json")
    assert resp.status_code == 200
    schema = resp.json()
    assert schema["info"]["title"] == "CodePulse"
    assert schema["info"]["version"] == "0.1.0"
    assert "/api/auth/register" in schema["paths"]
    assert "/api/snippets" in schema["paths"]