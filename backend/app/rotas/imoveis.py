"""
Rotas de imóveis (aba Visão Geral).

Todas as rotas exigem o token de acesso (JWT) e trabalham apenas com os
imóveis do usuário logado.

Endpoints:
    POST /imoveis        -> salva um novo imóvel
    PUT  /imoveis/{id}   -> salva as alterações de um imóvel existente
    GET  /imoveis        -> lista os imóveis do usuário (para carregar o 3D/mapa)
    DELETE /imoveis/{id} -> remove um imóvel
"""

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencias import SessaoBanco, UsuarioAtual
from app.esquemas.imovel import ImovelEntrada, ImovelSaida
from app.modelos.imovel import Imovel


def buscar_imovel_do_usuario(sessao: Session, imovel_id: int, usuario_id: int) -> Imovel:
    """
    Busca um imóvel do usuário logado.

    Raises:
        HTTPException 404: imóvel inexistente ou de outro usuário.
    """
    imovel = sessao.scalar(
        select(Imovel).where(Imovel.id == imovel_id, Imovel.usuario_id == usuario_id)
    )
    if imovel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imóvel não encontrado.")
    return imovel


router = APIRouter(
    prefix="/imoveis",
    tags=["Imóveis"],
    responses={401: {"description": "Token de acesso ausente, inválido ou expirado"}},
)


def _dados_para_banco(dados: ImovelEntrada) -> dict:
    """Converte o esquema de entrada em um dicionário pronto para o modelo."""
    valores = dados.model_dump()
    # Tuplas viram listas para serem salvas na coluna JSON
    for campo in ("posicao_3d", "escala_3d"):
        if valores[campo] is not None:
            valores[campo] = list(valores[campo])
    return valores


@router.post(
    "",
    response_model=ImovelSaida,
    status_code=status.HTTP_201_CREATED,
    summary="Salva um novo imóvel",
)
def criar_imovel(dados: ImovelEntrada, usuario: UsuarioAtual, sessao: SessaoBanco) -> Imovel:
    """Cadastra um imóvel vinculado ao usuário logado."""
    imovel = Imovel(usuario_id=usuario.id, **_dados_para_banco(dados))
    sessao.add(imovel)
    sessao.commit()
    sessao.refresh(imovel)
    return imovel


@router.put(
    "/{imovel_id}",
    response_model=ImovelSaida,
    summary="Salva as alterações de um imóvel",
    responses={404: {"description": "Imóvel não encontrado"}},
)
def atualizar_imovel(
    imovel_id: int, dados: ImovelEntrada, usuario: UsuarioAtual, sessao: SessaoBanco
) -> Imovel:
    """
    Substitui os dados de um imóvel do usuário logado.

    Envie o imóvel completo (mesmo formato do cadastro). Imóveis de outros
    usuários são tratados como inexistentes (404).
    """
    imovel = buscar_imovel_do_usuario(sessao, imovel_id, usuario.id)

    for campo, valor in _dados_para_banco(dados).items():
        setattr(imovel, campo, valor)
    sessao.commit()
    sessao.refresh(imovel)
    return imovel


@router.get("", response_model=list[ImovelSaida], summary="Lista os imóveis do usuário")
def listar_imoveis(usuario: UsuarioAtual, sessao: SessaoBanco) -> list[Imovel]:
    """Devolve todos os imóveis do usuário logado, ordenados pelo nome."""
    return list(
        sessao.scalars(
            select(Imovel).where(Imovel.usuario_id == usuario.id).order_by(Imovel.nome)
        )
    )


@router.delete(
    "/{imovel_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove um imóvel",
    responses={
        404: {"description": "Imóvel não encontrado"},
        409: {"description": "Imóvel com contratos vinculados"},
    },
)
def remover_imovel(imovel_id: int, usuario: UsuarioAtual, sessao: SessaoBanco) -> None:
    """
    Exclui um imóvel do usuário logado.

    Os inquilinos vinculados a ele continuam cadastrados, apenas sem imóvel.
    """
    imovel = buscar_imovel_do_usuario(sessao, imovel_id, usuario.id)
    sessao.delete(imovel)
    try:
        sessao.commit()
    except IntegrityError as erro:
        # A chave estrangeira (RESTRICT) impede excluir quem tem contratos
        sessao.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este imóvel possui contratos. Exclua os contratos antes de excluí-lo.",
        ) from erro
