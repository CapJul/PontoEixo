"""
Rotas de autenticação (seção de login).

Endpoints:
    POST /auth/login   -> valida e-mail e senha e devolve o token de acesso JWT
    GET  /auth/perfil  -> devolve o usuário dono do token (rota protegida)
"""

from fastapi import APIRouter, status
from sqlalchemy import select

from app.api.dependencias import SessaoBanco, UsuarioAtual, erro_nao_autenticado
from app.core.config import settings
from app.core.seguranca import HASH_FICTICIO, criar_token_acesso, verificar_senha
from app.esquemas.autenticacao import LoginEntrada, TokenSaida
from app.esquemas.usuario import UsuarioSaida
from app.modelos.usuario import Usuario

router = APIRouter(prefix="/auth", tags=["Autenticação"])


def montar_resposta_token(usuario: Usuario) -> TokenSaida:
    """Gera o token de acesso do usuário e monta a resposta padrão."""
    return TokenSaida(
        token_acesso=criar_token_acesso(usuario.id),
        expira_em_segundos=settings.MinutosExpiracaoTokenAcesso * 60,
        usuario=UsuarioSaida.model_validate(usuario),
    )


@router.post(
    "/login",
    response_model=TokenSaida,
    status_code=status.HTTP_200_OK,
    summary="Realiza o login",
    responses={401: {"description": "E-mail ou senha incorretos"}},
)
def login(dados: LoginEntrada, sessao: SessaoBanco) -> TokenSaida:
    """
    Autentica o usuário pelo e-mail e senha.

    Em caso de sucesso, devolve o `token_acesso` (JWT) que deve ser enviado no
    cabeçalho `Authorization: Bearer <token>` das rotas protegidas.

    A mensagem de erro é a mesma para e-mail inexistente e senha errada, para
    não revelar quais e-mails estão cadastrados.
    """
    usuario = sessao.scalar(select(Usuario).where(Usuario.email == dados.email))

    # Mesmo sem usuário, verifica um hash fictício para manter o tempo de resposta igual
    senha_correta = verificar_senha(
        dados.senha, usuario.senha_hash if usuario else HASH_FICTICIO
    )

    if usuario is None or not senha_correta or not usuario.ativo:
        raise erro_nao_autenticado("E-mail ou senha incorretos.")

    return montar_resposta_token(usuario)


@router.get(
    "/perfil",
    response_model=UsuarioSaida,
    summary="Retorna o usuário logado",
    responses={401: {"description": "Token ausente, inválido ou expirado"}},
)
def perfil(usuario: UsuarioAtual) -> UsuarioSaida:
    """Devolve os dados do usuário dono do token enviado (rota protegida por JWT)."""
    return UsuarioSaida.model_validate(usuario)
