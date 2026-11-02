"""Tipos reutilizados por vários esquemas."""

from typing import Annotated

from pydantic import AfterValidator, EmailStr


def _normalizar_email(email: str) -> str:
    """Remove espaços nas pontas e converte o e-mail para minúsculas."""
    return email.strip().lower()


# E-mail validado e sempre em minúsculas, para que "Joao@X.com" e
# "joao@x.com" sejam tratados como a mesma conta.
EmailNormalizado = Annotated[EmailStr, AfterValidator(_normalizar_email)]

