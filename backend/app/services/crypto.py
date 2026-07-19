"""Symmetric encryption for at-rest secrets (email credentials, API tokens).

Derives a Fernet key from SECRET_KEY so no extra key management is needed
for local/self-hosted deployments. For multi-tenant production deployments,
set a dedicated ENCRYPTION_KEY instead (see get_settings) — this module
already isolates all encrypt/decrypt calls behind two functions so that
swap is a one-line change.
"""
import base64
import hashlib

from cryptography.fernet import Fernet

from app.core.config import settings


def _derive_key() -> bytes:
    digest = hashlib.sha256(settings.SECRET_KEY.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest)


_fernet = Fernet(_derive_key())


def encrypt_secret(plaintext: str) -> str:
    return _fernet.encrypt(plaintext.encode("utf-8")).decode("utf-8")


def decrypt_secret(ciphertext: str) -> str:
    return _fernet.decrypt(ciphertext.encode("utf-8")).decode("utf-8")
