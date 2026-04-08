FROM python:3.13-slim AS builder

RUN pip install --no-cache-dir poetry
ENV POETRY_VIRTUALENVS_CREATE=false

WORKDIR /build
COPY pyproject.toml poetry.lock* ./
RUN poetry install --only main --no-interaction --no-ansi

FROM python:3.13-slim

WORKDIR /app
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]