"""Tipos reutilizados por vários esquemas."""

from typing import Annotated

from pydantic import AfterValidator, EmailStr, Field


def _normalizar_email(email: str) -> str:
    """Remove espaços nas pontas e converte o e-mail para minúsculas."""
    return email.strip().lower()


# E-mail validado e sempre em minúsculas, para que "Joao@X.com" e
# "joao@x.com" sejam tratados como a mesma conta.
EmailNormalizado = Annotated[EmailStr, AfterValidator(_normalizar_email)]


def _validar_forca_senha(senha: str) -> str:
    """Exige pelo menos uma letra e um número na senha."""
    if not any(caractere.isalpha() for caractere in senha):
        raise ValueError("A senha deve conter pelo menos uma letra.")
    if not any(caractere.isdigit() for caractere in senha):
        raise ValueError("A senha deve conter pelo menos um número.")
    return senha


# Senha com 8 a 128 caracteres, contendo letras e números.
SenhaForte = Annotated[
    str,
    Field(min_length=8, max_length=128, examples=["MinhaSenha123"]),
    AfterValidator(_validar_forca_senha),
]

