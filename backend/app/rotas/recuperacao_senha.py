"""
Rotas da seção de recuperação de senha.

Endpoints:
    POST /auth/recuperar-senha/solicitar-codigo -> envia o código de 6 dígitos por e-mail
    POST /auth/recuperar-senha/validar-codigo   -> confere o código e devolve o token de redefinição (JWT)
    POST /auth/recuperar-senha/redefinir        -> troca a senha (exige o token de redefinição)
"""

from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import select

from app.api.dependencias import SessaoBanco, erro_nao_autenticado, esquema_bearer
from app.core.config import settings
from app.core.seguranca import (
    TIPO_TOKEN_REDEFINICAO_SENHA,
    TokenInvalido,
    criar_token_redefinicao_senha,
    decodificar_token,
    gerar_hash_senha,
    verificar_codigo,
)
from app.esquemas.recuperacao_senha import (
    MensagemSaida,
    RedefinirSenhaEntrada,
    SolicitarCodigoEntrada,
    TokenRedefinicaoSaida,
    ValidarCodigoEntrada,
)
from app.modelos.codigo_recuperacao import CodigoRecuperacao
from app.modelos.usuario import Usuario
from app.servicos.recuperacao_senha import buscar_codigo_valido, gerar_e_enviar_codigo

router = APIRouter(prefix="/auth/recuperar-senha", tags=["Recuperação de senha"])

# Mensagem única para qualquer falha na validação, para não dar pistas a um atacante
ERRO_CODIGO_INVALIDO = "Código inválido ou expirado. Solicite um novo código."


@router.post(
    "/solicitar-codigo",
    response_model=MensagemSaida,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Envia o código de recuperação por e-mail (etapa 1)",
)
def solicitar_codigo(
    dados: SolicitarCodigoEntrada, sessao: SessaoBanco, tarefas: BackgroundTasks
) -> MensagemSaida:
    """
    Gera um código de 6 dígitos e envia para o e-mail informado.

    A resposta é **sempre a mesma**, exista ou não uma conta com o e-mail.
    Isso impede que alguém use esta rota para descobrir quais e-mails estão
    cadastrados. Pelo mesmo motivo, o e-mail é enviado em segundo plano.

    Se um código foi enviado há menos de `SegundosEntreEnviosCodigo` segundos,
    nenhum novo e-mail é enviado (o anterior continua valendo).
    """
    usuario = sessao.scalar(select(Usuario).where(Usuario.email == dados.email))
    if usuario is not None and usuario.ativo:
        gerar_e_enviar_codigo(sessao, usuario, tarefas)

    return MensagemSaida(
        mensagem="Se o e-mail estiver cadastrado, você receberá um código de verificação em instantes."
    )


@router.post(
    "/validar-codigo",
    response_model=TokenRedefinicaoSaida,
    summary="Valida o código recebido por e-mail (etapa 2)",
    responses={400: {"description": "Código inválido, expirado ou com tentativas esgotadas"}},
)
def validar_codigo(dados: ValidarCodigoEntrada, sessao: SessaoBanco) -> TokenRedefinicaoSaida:
    """
    Confere o código digitado pelo usuário.

    Se estiver correto, devolve o `token_redefinicao` (JWT), exigido na etapa 3
    para cadastrar a nova senha. Cada erro conta uma tentativa; ao atingir
    `MaximoTentativasCodigoRecuperacao`, o código é invalidado e o usuário
    precisa pedir outro.
    """
    usuario = sessao.scalar(select(Usuario).where(Usuario.email == dados.email))
    codigo = buscar_codigo_valido(sessao, usuario.id) if usuario and usuario.ativo else None

    if codigo is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=ERRO_CODIGO_INVALIDO)

    if not verificar_codigo(dados.codigo, codigo.codigo_hash):
        codigo.tentativas += 1
        if codigo.tentativas >= settings.MaximoTentativasCodigoRecuperacao:
            codigo.utilizado = True  # tentativas esgotadas: invalida o código
        sessao.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=ERRO_CODIGO_INVALIDO)

    return TokenRedefinicaoSaida(
        token_redefinicao=criar_token_redefinicao_senha(usuario.id, codigo.id),
        expira_em_segundos=settings.MinutosExpiracaoTokenRedefinicao * 60,
    )


def obter_codigo_do_token_redefinicao(
    sessao: SessaoBanco,
    credenciais: Annotated[HTTPAuthorizationCredentials | None, Depends(esquema_bearer)],
) -> CodigoRecuperacao:
    """
    Dependência que valida o token de redefinição enviado no cabeçalho Authorization.

    Aceita apenas tokens do tipo `redefinicao_senha` (o token de acesso do login
    não serve aqui) e garante que o código validado ainda não foi usado.

    Returns:
        O código de recuperação vinculado ao token (com o usuário carregado).

    Raises:
        HTTPException 401: token ausente, inválido, expirado ou já utilizado.
    """
    if credenciais is None:
        raise erro_nao_autenticado("Token de redefinição não informado.")

    try:
        conteudo = decodificar_token(credenciais.credentials, TIPO_TOKEN_REDEFINICAO_SENHA)
    except TokenInvalido as erro:
        raise erro_nao_autenticado(str(erro)) from erro

    codigo_id = conteudo.get("cid")
    codigo = sessao.get(CodigoRecuperacao, codigo_id) if isinstance(codigo_id, int) else None
    if (
        codigo is None
        or codigo.utilizado
        or str(codigo.usuario_id) != conteudo["sub"]
        or not codigo.usuario.ativo
    ):
        raise erro_nao_autenticado("Token de redefinição inválido ou já utilizado.")

    return codigo


@router.post(
    "/redefinir",
    response_model=MensagemSaida,
    summary="Cadastra a nova senha (etapa 3)",
    responses={
        401: {"description": "Token de redefinição ausente, inválido, expirado ou já utilizado"},
        422: {"description": "Senha fraca ou confirmação diferente"},
    },
)
def redefinir_senha(
    dados: RedefinirSenhaEntrada,
    sessao: SessaoBanco,
    codigo: Annotated[CodigoRecuperacao, Depends(obter_codigo_do_token_redefinicao)],
) -> MensagemSaida:
    """
    Troca a senha do usuário.

    Exige no cabeçalho `Authorization: Bearer <token_redefinicao>` o token
    devolvido pela etapa 2 (`/validar-codigo`). Depois do uso, o código e o
    token são invalidados: para trocar a senha de novo, é preciso pedir outro código.
    """
    codigo.usuario.senha_hash = gerar_hash_senha(dados.nova_senha)
    codigo.utilizado = True
    sessao.commit()

    return MensagemSaida(mensagem="Senha redefinida com sucesso. Faça login com a nova senha.")
