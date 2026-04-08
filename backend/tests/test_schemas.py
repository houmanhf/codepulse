"""Tests for Pydantic schemas: validation, serialization, edge cases."""

import pytest
from pydantic import ValidationError

from app.schemas.user import UserCreate, UserLogin
from app.schemas.snippet import SnippetCreate, SnippetUpdate
from app.schemas.review import ReviewCreate
from app.schemas.comment import CommentCreate


class TestUserSchemas:
    def test_user_create_valid(self):
        user = UserCreate(email="test@example.com", username="alice", password="secret123")
        assert user.email == "test@example.com"
        assert user.username == "alice"

    def test_user_create_invalid_email(self):
        with pytest.raises(ValidationError):
            UserCreate(email="not-an-email", username="alice", password="secret123")

    def test_user_create_missing_fields(self):
        with pytest.raises(ValidationError):
            UserCreate(email="a@b.com")  # type: ignore

    def test_user_login_valid(self):
        login = UserLogin(email="test@example.com", password="pass")
        assert login.email == "test@example.com"

    def test_user_login_invalid_email(self):
        with pytest.raises(ValidationError):
            UserLogin(email="bad", password="pass")


class TestSnippetSchemas:
    def test_snippet_create_valid(self):
        s = SnippetCreate(title="Hello", code="print(1)", language="python")
        assert s.title == "Hello"
        assert s.description is None

    def test_snippet_create_with_description(self):
        s = SnippetCreate(
            title="Hello", code="print(1)", language="python", description="A test"
        )
        assert s.description == "A test"

    def test_snippet_create_missing_required(self):
        with pytest.raises(ValidationError):
            SnippetCreate(title="Hello")  # type: ignore

    def test_snippet_update_partial(self):
        u = SnippetUpdate(title="New Title")
        assert u.title == "New Title"
        assert u.code is None
        assert u.language is None

    def test_snippet_update_empty(self):
        u = SnippetUpdate()
        assert u.title is None


class TestReviewSchemas:
    def test_review_create_approved(self):
        r = ReviewCreate(status="approved")
        assert r.status.value == "approved"
        assert r.body is None

    def test_review_create_changes_requested(self):
        r = ReviewCreate(status="changes_requested", body="Fix line 5")
        assert r.body == "Fix line 5"

    def test_review_create_invalid_status(self):
        with pytest.raises(ValidationError):
            ReviewCreate(status="invalid_status")  # type: ignore


class TestCommentSchemas:
    def test_comment_create_valid(self):
        c = CommentCreate(line_number=10, body="Nice code")
        assert c.line_number == 10
        assert c.body == "Nice code"

    def test_comment_create_missing_body(self):
        with pytest.raises(ValidationError):
            CommentCreate(line_number=1)  # type: ignore