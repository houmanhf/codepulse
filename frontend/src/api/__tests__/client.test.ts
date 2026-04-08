import client from "../client";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(client);

beforeEach(() => {
  mock.reset();
  localStorage.clear();
  // prevent jsdom navigation errors
  delete (window as any).location;
  (window as any).location = { href: "" };
});

describe("api client", () => {
  it("attaches auth token to requests when available", async () => {
    localStorage.setItem("token", "test-jwt-token");
    mock.onGet("/test").reply(200, { ok: true });

    const res = await client.get("/test");
    expect(res.data).toEqual({ ok: true });

    const authHeader = mock.history.get[0].headers?.Authorization;
    expect(authHeader).toBe("Bearer test-jwt-token");
  });

  it("sends requests without auth header when no token", async () => {
    mock.onGet("/test").reply(200, { ok: true });

    await client.get("/test");

    const authHeader = mock.history.get[0].headers?.Authorization;
    expect(authHeader).toBeUndefined();
  });

  it("clears token and redirects on 401", async () => {
    localStorage.setItem("token", "expired-token");
    mock.onGet("/protected").reply(401);

    await expect(client.get("/protected")).rejects.toThrow();

    expect(localStorage.getItem("token")).toBeNull();
    expect(window.location.href).toBe("/login");
  });
});
