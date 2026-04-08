"""Tests for core/security.py: password hashing, JWT tokens."""

from datetime import timedelta

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


class TestPasswordHashing:
    def test_hash_returns_different_string(self):
        hashed = hash_password("mysecret")
        assert hashed != "mysecret"
        assert len(hashed) > 20

    def test_verify_correct_password(self):
        hashed = hash_password("correct-password")
        assert verify_password("correct-password", hashed) is True

    def test_verify_wrong_password(self):
        hashed = hash_password("correct-password")
        assert verify_password("wrong-password", hashed) is False

    def test_different_passwords_produce_different_hashes(self):
        h1 = hash_password("password1")
        h2 = hash_password("password2")
        assert h1 != h2

    def test_same_password_produces_different_hashes_due_to_salt(self):
        h1 = hash_password("same")
        h2 = hash_password("same")
        assert h1 != h2  # bcrypt uses random salt


class TestJWT:
    def test_create_and_decode_token(self):
        token = create_access_token("user-123")
        subject = decode_access_token(token)
        assert subject == "user-123"

    def test_token_with_custom_expiry(self):
        token = create_access_token("user-456", expires_delta=timedelta(hours=2))
        subject = decode_access_token(token)
        assert subject == "user-456"

    def test_decode_invalid_token_returns_none(self):
        result = decode_access_token("not-a-valid-jwt")
        assert result is None

    def test_decode_tampered_token_returns_none(self):
        token = create_access_token("user-789")
        tampered = token[:-5] + "XXXXX"
        result = decode_access_token(tampered)
        assert result is None

    def test_decode_expired_token_returns_none(self):
        token = create_access_token("user-exp", expires_delta=timedelta(seconds=-1))
        result = decode_access_token(token)
        assert result is None

    def test_token_contains_subject(self):
        import jwt as pyjwt
        from app.core.config import settings

        token = create_access_token("my-sub")
        payload = pyjwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert payload["sub"] == "my-sub"
        assert "exp" in payload