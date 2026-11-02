"""Esquemas usados nos endpoints de recuperação de senha."""

from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.esquemas.comum import EmailNormalizado, SenhaForte


class SolicitarCodigoEntrada(BaseModel):
    """Etapa 1: e-mail da conta que terá a senha recuperada."""

    email: EmailNormalizado = Field(examples=["joao@exemplo.com"])


class ValidarCodigoEntrada(BaseModel):
    """Etapa 2: e-mail e código de 6 dígitos recebido por e-mail."""

    email: EmailNormalizado = Field(examples=["joao@exemplo.com"])
    codigo: str = Field(pattern=r"^\d{6}$", examples=["048213"], description="Código de 6 dígitos")


class TokenRedefinicaoSaida(BaseModel):
    """
    Resposta da validação do código.

    O `token_redefinicao` deve ser enviado na etapa 3 (redefinir senha), no
    cabeçalho `Authorization: Bearer <token_redefinicao>`. Ele não serve para
    acessar as outras rotas da API.
    """

    token_redefinicao: str
    tipo_token: Literal["bearer"] = "bearer"
    expira_em_segundos: int


class RedefinirSenhaEntrada(BaseModel):
    """Etapa 3: nova senha escolhida pelo usuário."""

    nova_senha: SenhaForte
    confirmacao_senha: str = Field(examples=["MinhaSenha123"])

    @model_validator(mode="after")
    def validar_confirmacao(self) -> "RedefinirSenhaEntrada":
        """Confere se a nova senha e a confirmação são iguais."""
        if self.nova_senha != self.confirmacao_senha:
            raise ValueError("A nova senha e a confirmação de senha não conferem.")
        return self


class MensagemSaida(BaseModel):
    """Resposta simples contendo apenas uma mensagem."""

    mensagem: str
