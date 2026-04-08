"""Seed the database with mock data for local testing.

Usage:
    python scripts/seed.py              # against localhost:8000
    python scripts/seed.py http://host  # custom base URL
"""

import sys
import httpx

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
API = f"{BASE}/api"

USERS = [
    {"email": "alice@codepulse.dev", "username": "alice", "password": "password123"},
    {"email": "bob@codepulse.dev", "username": "bob", "password": "password123"},
    {"email": "charlie@codepulse.dev", "username": "charlie", "password": "password123"},
]

SNIPPETS = [
    {
        "owner": "alice",
        "title": "Binary Search",
        "language": "python",
        "description": "Classic binary search with edge case handling",
        "code": """\
def binary_search(arr: list[int], target: int) -> int:
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


if __name__ == "__main__":
    data = [1, 3, 5, 7, 9, 11, 13]
    print(binary_search(data, 7))   # 3
    print(binary_search(data, 4))   # -1
""",
    },
    {
        "owner": "bob",
        "title": "Express JWT Middleware",
        "language": "typescript",
        "description": "Auth middleware for Express with token refresh",
        "code": """\
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!);
    req.userId = (payload as { sub: string }).sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
""",
    },
    {
        "owner": "charlie",
        "title": "React useDebounce Hook",
        "language": "typescript",
        "description": "Custom hook to debounce rapidly changing values",
        "code": """\
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage:
// const searchTerm = useDebounce(inputValue, 300);
""",
    },
    {
        "owner": "alice",
        "title": "Dockerfile Multi-stage Build",
        "language": "bash",
        "description": "Production Dockerfile for a Go service",
        "code": """\
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server ./cmd/server

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/server /usr/local/bin/server
EXPOSE 8080
CMD ["server"]
""",
    },
    {
        "owner": "bob",
        "title": "SQL Window Functions",
        "language": "sql",
        "description": "Common window function patterns for analytics",
        "code": """\
-- Running total of revenue per month
SELECT
    date_trunc('month', created_at) AS month,
    SUM(amount)                     AS monthly_revenue,
    SUM(SUM(amount)) OVER (
        ORDER BY date_trunc('month', created_at)
    )                               AS cumulative_revenue
FROM orders
GROUP BY month
ORDER BY month;

-- Rank users by total spending
SELECT
    user_id,
    SUM(amount) AS total_spent,
    RANK() OVER (ORDER BY SUM(amount) DESC) AS spending_rank
FROM orders
GROUP BY user_id
ORDER BY spending_rank;
""",
    },
    {
        "owner": "charlie",
        "title": "Kubernetes Deployment Manifest",
        "language": "yaml",
        "description": "Production-ready K8s deployment with health checks",
        "code": """\
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
  labels:
    app: api-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-server
  template:
    metadata:
      labels:
        app: api-server
    spec:
      containers:
        - name: api
          image: ghcr.io/org/api-server:latest
          ports:
            - containerPort: 8080
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
""",
    },
]

REVIEWS = [
    {
        "snippet_title": "Binary Search",
        "reviewer": "bob",
        "status": "changes_requested",
        "body": "Consider using (lo + hi) >> 1 to avoid potential overflow in other languages. Also, add type hints for the return value.",
    },
    {
        "snippet_title": "Binary Search",
        "reviewer": "charlie",
        "status": "approved",
        "body": "Clean implementation. The edge cases are handled well.",
    },
    {
        "snippet_title": "Express JWT Middleware",
        "reviewer": "alice",
        "status": "changes_requested",
        "body": "You should handle token expiration separately from invalid tokens to give better error messages to the client.",
    },
    {
        "snippet_title": "React useDebounce Hook",
        "reviewer": "alice",
        "status": "approved",
        "body": "Nice and clean. Works perfectly for search inputs.",
    },
    {
        "snippet_title": "React useDebounce Hook",
        "reviewer": "bob",
        "status": "approved",
        "body": "LGTM. Consider adding a useThrottle variant too.",
    },
    {
        "snippet_title": "SQL Window Functions",
        "reviewer": "charlie",
        "status": "approved",
        "body": "Great reference. These are the patterns I use most often.",
    },
    {
        "snippet_title": "Kubernetes Deployment Manifest",
        "reviewer": "alice",
        "status": "changes_requested",
        "body": "Add pod disruption budget and anti-affinity rules for true production readiness.",
    },
]

COMMENTS = [
    {
        "snippet_title": "Binary Search",
        "author": "bob",
        "line_number": 4,
        "body": "This can overflow in languages with fixed-size integers. Use (lo + hi) >> 1 or lo + (hi - lo) // 2.",
    },
    {
        "snippet_title": "Binary Search",
        "author": "charlie",
        "line_number": 12,
        "body": "Returning -1 is fine for this case, but raising ValueError might be more Pythonic.",
    },
    {
        "snippet_title": "Express JWT Middleware",
        "author": "alice",
        "line_number": 15,
        "body": "The non-null assertion on JWT_SECRET is risky. Validate env vars at startup instead.",
    },
    {
        "snippet_title": "Express JWT Middleware",
        "author": "charlie",
        "line_number": 20,
        "body": "Catch block should distinguish between TokenExpiredError and JsonWebTokenError.",
    },
    {
        "snippet_title": "Dockerfile Multi-stage Build",
        "author": "bob",
        "line_number": 5,
        "body": "Nice pattern downloading deps before copying source. Maximizes Docker layer caching.",
    },
    {
        "snippet_title": "Kubernetes Deployment Manifest",
        "author": "bob",
        "line_number": 6,
        "body": "3 replicas is good for HA but make sure your HPA is configured if traffic is variable.",
    },
]


def main():
    client = httpx.Client(timeout=15)

    # Check API is up
    try:
        r = client.get(f"{BASE}/health")
        r.raise_for_status()
    except httpx.ConnectError:
        print(f"Cannot reach {BASE}. Is the API running?")
        sys.exit(1)

    print("Seeding users...")
    tokens = {}
    for u in USERS:
        r = client.post(f"{API}/auth/register", json=u)
        if r.status_code == 201:
            tokens[u["username"]] = r.json()["access_token"]
            print(f"  + {u['username']}")
        elif r.status_code == 409:
            # Already exists, log in instead
            r = client.post(f"{API}/auth/login", json={"email": u["email"], "password": u["password"]})
            tokens[u["username"]] = r.json()["access_token"]
            print(f"  = {u['username']} (already exists)")
        else:
            print(f"  ! {u['username']} failed: {r.status_code} {r.text}")
            sys.exit(1)

    def headers(username):
        return {"Authorization": f"Bearer {tokens[username]}"}

    print("\nSeeding snippets...")
    snippet_ids = {}
    for s in SNIPPETS:
        payload = {k: v for k, v in s.items() if k != "owner"}
        r = client.post(f"{API}/snippets", json=payload, headers=headers(s["owner"]))
        if r.status_code == 201:
            snippet_ids[s["title"]] = r.json()["id"]
            print(f"  + \"{s['title']}\" by {s['owner']}")
        else:
            print(f"  ! \"{s['title']}\" failed: {r.status_code}")

    print("\nSeeding reviews...")
    for rv in REVIEWS:
        sid = snippet_ids.get(rv["snippet_title"])
        if not sid:
            continue
        r = client.post(
            f"{API}/snippets/{sid}/reviews",
            json={"status": rv["status"], "body": rv["body"]},
            headers=headers(rv["reviewer"]),
        )
        status = "ok" if r.status_code == 201 else f"failed ({r.status_code})"
        print(f"  {rv['reviewer']} -> \"{rv['snippet_title']}\": {status}")

    print("\nSeeding comments...")
    for c in COMMENTS:
        sid = snippet_ids.get(c["snippet_title"])
        if not sid:
            continue
        r = client.post(
            f"{API}/snippets/{sid}/comments",
            json={"line_number": c["line_number"], "body": c["body"]},
            headers=headers(c["author"]),
        )
        status = "ok" if r.status_code == 201 else f"failed ({r.status_code})"
        print(f"  L{c['line_number']} on \"{c['snippet_title']}\" by {c['author']}: {status}")

    print(f"\nDone! Login at {BASE.replace('8000','3000')}/login with any user (password: password123)")
    print("Users: alice@codepulse.dev / bob@codepulse.dev / charlie@codepulse.dev")


if __name__ == "__main__":
    main()