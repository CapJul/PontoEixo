"""
Rotas de pagamentos de aluguel (modal "Pagamentos" de cada contrato).

Todas as rotas exigem o token de acesso (JWT) e trabalham apenas com os
contratos do usuário logado.

Endpoints:
    POST   /contratos/{id}/pagamentos -> registra um aluguel recebido
    GET    /contratos/{id}/pagamentos -> lista os pagamentos do contrato
    DELETE /pagamentos/{id}           -> remove um pagamento
"""

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.api.dependencias import SessaoBanco, UsuarioAtual
from app.esquemas.pagamento import PagamentoEntrada, PagamentoSaida
from app.modelos.pagamento import Pagamento
from app.rotas.contratos import buscar_contrato_do_usuario

router = APIRouter(
    tags=["Pagamentos"],
    responses={401: {"description": "Token de acesso ausente, inválido ou expirado"}},
)

ERRO_COMPETENCIA_PAGA = "Já existe um pagamento registrado para este mês neste contrato."


@router.post(
    "/contratos/{contrato_id}/pagamentos",
    response_model=PagamentoSaida,
    status_code=status.HTTP_201_CREATED,
    summary="Registra um aluguel recebido",
    responses={
        404: {"description": "Contrato não encontrado"},
        409: {"description": "Mês de competência já pago"},
        422: {"description": "Dados inválidos ou mês fora da vigência do contrato"},
    },
)
def registrar_pagamento(
    contrato_id: int, dados: PagamentoEntrada, usuario: UsuarioAtual, sessao: SessaoBanco
) -> Pagamento:
    """
    Registra o pagamento do aluguel de um mês (competência) do contrato.

    Regras:
    - a competência precisa estar dentro da vigência do contrato;
    - cada competência só pode ser paga uma vez por contrato.
    """
    contrato = buscar_contrato_do_usuario(sessao, contrato_id, usuario.id)

    primeiro_mes = contrato.data_inicio.replace(day=1)
    ultimo_mes = contrato.data_fim.replace(day=1)
    if not primeiro_mes <= dados.competencia <= ultimo_mes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="O mês de competência precisa estar dentro da vigência do contrato.",
        )

    if any(p.competencia == dados.competencia for p in contrato.pagamentos):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=ERRO_COMPETENCIA_PAGA)

    pagamento = Pagamento(usuario_id=usuario.id, contrato_id=contrato.id, **dados.model_dump())
    sessao.add(pagamento)
    try:
        sessao.commit()
    except IntegrityError as erro:
        # Dois registros simultâneos do mesmo mês: a restrição única do banco barra o segundo
        sessao.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=ERRO_COMPETENCIA_PAGA) from erro

    sessao.refresh(pagamento)
    return pagamento


@router.get(
    "/contratos/{contrato_id}/pagamentos",
    response_model=list[PagamentoSaida],
    summary="Lista os pagamentos de um contrato",
    responses={404: {"description": "Contrato não encontrado"}},
)
def listar_pagamentos(contrato_id: int, usuario: UsuarioAtual, sessao: SessaoBanco) -> list[Pagamento]:
    """Devolve os pagamentos do contrato, do mês mais recente para o mais antigo."""
    contrato = buscar_contrato_do_usuario(sessao, contrato_id, usuario.id)
    return sorted(contrato.pagamentos, key=lambda p: p.competencia, reverse=True)


@router.delete(
    "/pagamentos/{pagamento_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove um pagamento",
    responses={404: {"description": "Pagamento não encontrado"}},
)
def remover_pagamento(pagamento_id: int, usuario: UsuarioAtual, sessao: SessaoBanco) -> None:
    """Exclui um pagamento registrado por engano."""
    pagamento = sessao.scalar(
        select(Pagamento).where(Pagamento.id == pagamento_id, Pagamento.usuario_id == usuario.id)
    )
    if pagamento is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pagamento não encontrado.")
    sessao.delete(pagamento)
    sessao.commit()
