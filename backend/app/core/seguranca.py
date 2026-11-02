"""
Funções de segurança: hash de senhas e tokens JWT.

- Senhas são protegidas com Argon2 (algoritmo recomendado atualmente),
  através da biblioteca `pwdlib`.
- Tokens JWT são assinados com a chave `ChaveSecretaJwt` do .env.
  Todo token carrega o campo `tipo`, que diz para que ele serve. Assim, um
  token criado para uma finalidade (ex.: redefinir senha) não pode ser usado
  para outra (ex.: acessar a API).
"""

import hashlib
import hmac
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from pwdlib import PasswordHash

from app.core.config import settings

# Tipos de token emitidos pela API
TIPO_TOKEN_ACESSO = "acesso"
TIPO_TOKEN_REDEFINICAO_SENHA = "redefinicao_senha"

# Gerenciador de hash com a configuração recomendada (Argon2)
_gerenciador_hash = PasswordHash.recommended()

# Hash de uma senha qualquer, usado para gastar o mesmo tempo de verificação
# quando o e-mail informado no login não existe (evita que um atacante
# descubra e-mails cadastrados medindo o tempo de resposta).
HASH_FICTICIO = _gerenciador_hash.hash("senha-ficticia-para-comparacao")


class TokenInvalido(Exception):
    """Lançada quando um token está expirado, adulterado ou é do tipo errado."""


# ----------------------------------------------------------------------
# Senhas
# ----------------------------------------------------------------------
def gerar_hash_senha(senha: str) -> str:
    """Gera o hash Argon2 de uma senha em texto puro."""
    return _gerenciador_hash.hash(senha)


def verificar_senha(senha: str, senha_hash: str) -> bool:
    """Retorna True se a senha em texto puro corresponde ao hash armazenado."""
    return _gerenciador_hash.verify(senha, senha_hash)


# ----------------------------------------------------------------------
# Códigos de recuperação de senha
# ----------------------------------------------------------------------
def gerar_codigo_numerico(quantidade_digitos: int = 6) -> str:
    """Gera um código numérico aleatório e seguro (ex.: '048213')."""
    return "".join(secrets.choice(string.digits) for _ in range(quantidade_digitos))


def gerar_hash_codigo(codigo: str) -> str:
    """
    Gera o hash (HMAC-SHA256) de um código de recuperação.

    O código nunca é salvo em texto puro no banco. Usamos HMAC com a chave
    secreta da aplicação, então o hash não pode ser revertido sem ela.
    """
    return hmac.new(
        settings.ChaveSecretaJwt.encode(), codigo.encode(), hashlib.sha256
    ).hexdigest()


def verificar_codigo(codigo: str, codigo_hash: str) -> bool:
    """Compara o código digitado com o hash salvo, em tempo constante."""
    return hmac.compare_digest(gerar_hash_codigo(codigo), codigo_hash)


# ----------------------------------------------------------------------
# Tokens JWT
# ----------------------------------------------------------------------
def criar_token(
    assunto: str | int,
    tipo: str,
    minutos_validade: int,
    dados_extras: dict[str, Any] | None = None,
) -> str:
    """
    Cria um token JWT assinado.

    Args:
        assunto: identificador do dono do token (normalmente o id do usuário).
        tipo: finalidade do token (ex.: TIPO_TOKEN_ACESSO).
        minutos_validade: por quantos minutos o token será aceito.
        dados_extras: informações adicionais a incluir no token.

    Returns:
        O token codificado, pronto para ser enviado ao cliente.
    """
    agora = datetime.now(timezone.utc)
    conteudo: dict[str, Any] = {
        "sub": str(assunto),
        "tipo": tipo,
        "iat": agora,
        "exp": agora + timedelta(minutes=minutos_validade),
    }
    if dados_extras:
        conteudo.update(dados_extras)

    return jwt.encode(conteudo, settings.ChaveSecretaJwt, algorithm=settings.AlgoritmoJwt)


def criar_token_acesso(usuario_id: int) -> str:
    """Cria o token de acesso entregue ao usuário após login ou cadastro."""
    return criar_token(
        assunto=usuario_id,
        tipo=TIPO_TOKEN_ACESSO,
        minutos_validade=settings.MinutosExpiracaoTokenAcesso,
    )


def criar_token_redefinicao_senha(usuario_id: int, codigo_id: int) -> str:
    """
    Cria o token entregue após o usuário validar o código de recuperação.

    Ele só serve para redefinir a senha (não dá acesso às demais rotas) e
    carrega o id do código validado (`cid`), para que o mesmo código não
    possa ser usado duas vezes.
    """
    return criar_token(
        assunto=usuario_id,
        tipo=TIPO_TOKEN_REDEFINICAO_SENHA,
        minutos_validade=settings.MinutosExpiracaoTokenRedefinicao,
        dados_extras={"cid": codigo_id},
    )


def decodificar_token(token: str, tipo_esperado: str) -> dict[str, Any]:
    """
    Valida a assinatura, a validade e o tipo de um token JWT.

    Args:
        token: token recebido no cabeçalho Authorization.
        tipo_esperado: tipo que o token precisa ter para ser aceito.

    Returns:
        O conteúdo (claims) do token.

    Raises:
        TokenInvalido: se o token estiver expirado, adulterado ou for de outro tipo.
    """
    try:
        conteudo = jwt.decode(
            token,
            settings.ChaveSecretaJwt,
            algorithms=[settings.AlgoritmoJwt],
            options={"require": ["sub", "exp", "tipo"]},
        )
    except jwt.ExpiredSignatureError as erro:
        raise TokenInvalido("Token expirado.") from erro
    except jwt.PyJWTError as erro:
        raise TokenInvalido("Token inválido.") from erro

    if conteudo.get("tipo") != tipo_esperado:
        raise TokenInvalido("Token não permitido para esta operação.")

    return conteudo
