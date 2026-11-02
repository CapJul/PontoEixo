"""
Dependências reutilizáveis pelas rotas do FastAPI.

Para proteger uma rota com JWT, basta receber o usuário atual como parâmetro:

    from app.api.dependencias import UsuarioAtual

    @router.get("/rota-protegida")
    def rota(usuario: UsuarioAtual):
        ...

Se o token estiver ausente, expirado ou inválido, a API responde 401
automaticamente e a função da rota nem é executada.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.seguranca import TIPO_TOKEN_ACESSO, TokenInvalido, decodificar_token
from app.db.sessao import obter_sessao
from app.modelos.usuario import Usuario

# Lê o cabeçalho "Authorization: Bearer <token>".
# `auto_error=False` permite devolver nossa própria mensagem de erro (401).
esquema_bearer = HTTPBearer(
    auto_error=False,
    description="Cole aqui o `token_acesso` devolvido pelo login.",
)

# Atalho para receber a sessão do banco nas rotas
SessaoBanco = Annotated[Session, Depends(obter_sessao)]


def erro_nao_autenticado(detalhe: str) -> HTTPException:
    """Monta a resposta 401 padrão para falhas de autenticação."""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detalhe,
        headers={"WWW-Authenticate": "Bearer"},
    )


def obter_usuario_atual(
    sessao: SessaoBanco,
    credenciais: Annotated[HTTPAuthorizationCredentials | None, Depends(esquema_bearer)],
) -> Usuario:
    """
    Identifica o usuário dono do token de acesso enviado na requisição.

    Raises:
        HTTPException 401: token ausente, inválido, expirado, de outro tipo,
            ou usuário inexistente/inativo.
    """
    if credenciais is None:
        raise erro_nao_autenticado("Token de acesso não informado.")

    try:
        conteudo = decodificar_token(credenciais.credentials, TIPO_TOKEN_ACESSO)
    except TokenInvalido as erro:
        raise erro_nao_autenticado(str(erro)) from erro

    usuario = sessao.get(Usuario, int(conteudo["sub"]))
    if usuario is None or not usuario.ativo:
        raise erro_nao_autenticado("Usuário não encontrado ou inativo.")

    return usuario


# Atalho para receber o usuário logado nas rotas protegidas
UsuarioAtual = Annotated[Usuario, Depends(obter_usuario_atual)]
