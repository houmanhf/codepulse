import client from "../client";
import MockAdapter from "axios-mock-adapter";
import { login, register, getMe } from "../auth";

const mock = new MockAdapter(client);

beforeEach(() => {
  mock.reset();
});

describe("auth API", () => {
  it("login sends credentials and returns token", async () => {
    const response = { access_token: "jwt-token", token_type: "bearer" };
    mock.onPost("/auth/login").reply(200, response);

    const result = await login({ email: "a@b.com", password: "pass" });
    expect(result).toEqual(response);
    expect(mock.history.post[0].data).toBe(
      JSON.stringify({ email: "a@b.com", password: "pass" })
    );
  });

  it("register sends user data and returns user + token", async () => {
    const response = {
      user: {
        id: "u1",
        email: "a@b.com",
        username: "alice",
        created_at: "2024-01-01",
      },
      access_token: "new-token",
    };
    mock.onPost("/auth/register").reply(201, response);

    const result = await register({
      email: "a@b.com",
      username: "alice",
      password: "secret",
    });
    expect(result.user.username).toBe("alice");
    expect(result.access_token).toBe("new-token");
  });

  it("getMe returns current user", async () => {
    const user = {
      id: "u1",
      email: "a@b.com",
      username: "alice",
      created_at: "2024-01-01",
    };
    mock.onGet("/auth/me").reply(200, user);

    const result = await getMe();
    expect(result.username).toBe("alice");
  });

  it("login throws on 401", async () => {
    mock.onPost("/auth/login").reply(401, { detail: "Invalid credentials" });
    await expect(
      login({ email: "a@b.com", password: "wrong" })
    ).rejects.toThrow();
  });

  it("register throws on 409 conflict", async () => {
    mock.onPost("/auth/register").reply(409, { detail: "Email taken" });
    await expect(
      register({ email: "a@b.com", username: "alice", password: "pass" })
    ).rejects.toThrow();
  });
});