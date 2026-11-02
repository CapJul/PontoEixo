"""Esquemas usados nos endpoints de autenticação."""

from typing import Literal

from pydantic import BaseModel, Field

from app.esquemas.comum import EmailNormalizado
from app.esquemas.usuario import UsuarioSaida


class LoginEntrada(BaseModel):
    """Credenciais enviadas pela tela de login."""

    email: EmailNormalizado = Field(examples=["joao@exemplo.com"])
    senha: str = Field(min_length=1, examples=["MinhaSenha123"])


class TokenSaida(BaseModel):
    """
    Resposta de login (e de cadastro).

    O frontend deve enviar `token_acesso` nas próximas requisições, no
    cabeçalho: `Authorization: Bearer <token_acesso>`.
    """

    token_acesso: str
    tipo_token: Literal["bearer"] = "bearer"
    expira_em_segundos: int = Field(description="Tempo de validade do token, em segundos")
    usuario: UsuarioSaida
