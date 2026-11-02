"""Esquemas usados nos endpoints de autenticação."""

from typing import Annotated, Literal

from pydantic import BaseModel, Field, StringConstraints, model_validator

from app.esquemas.comum import EmailNormalizado, SenhaForte
from app.esquemas.usuario import UsuarioSaida


class CadastroEntrada(BaseModel):
    """Dados enviados pela tela de cadastro (criar conta)."""

    nome: Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=150)] = Field(
        examples=["João da Silva"]
    )
    email: EmailNormalizado = Field(examples=["joao@exemplo.com"])
    senha: SenhaForte
    confirmacao_senha: str = Field(examples=["MinhaSenha123"])
    aceite_termos: bool = Field(
        description="Precisa ser true: o usuário aceitou os Termos de Uso e a Política de Privacidade"
    )

    @model_validator(mode="after")
    def validar_regras_cadastro(self) -> "CadastroEntrada":
        """Confere se as senhas são iguais e se os termos foram aceitos."""
        if self.senha != self.confirmacao_senha:
            raise ValueError("A senha e a confirmação de senha não conferem.")
        if not self.aceite_termos:
            raise ValueError("É necessário aceitar os termos de uso para se cadastrar.")
        return self


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
