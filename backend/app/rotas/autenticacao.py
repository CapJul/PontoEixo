"""
Rotas de autenticação (seções de cadastro e login).

Endpoints:
    POST /auth/cadastro -> cria a conta do usuário e já devolve o token de acesso JWT
    POST /auth/login   -> valida e-mail e senha e devolve o token de acesso JWT
    GET  /auth/perfil  -> devolve o usuário dono do token (rota protegida)
"""

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.api.dependencias import SessaoBanco, UsuarioAtual, erro_nao_autenticado
from app.core.config import settings
from app.core.seguranca import (
    HASH_FICTICIO,
    criar_token_acesso,
    gerar_hash_senha,
    verificar_senha,
)
from app.esquemas.autenticacao import CadastroEntrada, LoginEntrada, TokenSaida
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
    "/cadastro",
    response_model=TokenSaida,
    status_code=status.HTTP_201_CREATED,
    summary="Cria uma nova conta",
    responses={
        409: {"description": "Já existe uma conta com este e-mail"},
        422: {"description": "Dados inválidos (senha fraca, senhas diferentes, termos não aceitos...)"},
    },
)
def cadastro(dados: CadastroEntrada, sessao: SessaoBanco) -> TokenSaida:
    """
    Cadastra um novo usuário e já devolve o token de acesso.

    Assim o frontend pode levar o usuário direto para a página inicial após o
    cadastro, sem precisar fazer login de novo.

    Regras de validação:
    - nome com 3 a 150 caracteres;
    - e-mail válido e ainda não cadastrado;
    - senha com 8 a 128 caracteres, contendo letras e números;
    - `confirmacao_senha` igual à `senha`;
    - `aceite_termos` igual a true.
    """
    email_ja_existe = sessao.scalar(select(Usuario.id).where(Usuario.email == dados.email))
    if email_ja_existe:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe uma conta cadastrada com este e-mail.",
        )

    usuario = Usuario(
        nome=dados.nome,
        email=dados.email,
        senha_hash=gerar_hash_senha(dados.senha),
    )
    sessao.add(usuario)

    try:
        sessao.commit()
    except IntegrityError as erro:
        # Dois cadastros simultâneos com o mesmo e-mail: o índice único do banco barra o segundo
        sessao.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe uma conta cadastrada com este e-mail.",
        ) from erro

    sessao.refresh(usuario)
    return montar_resposta_token(usuario)


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
