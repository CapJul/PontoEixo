"""
Rotas de contratos (aba Contratos).

Todas as rotas exigem o token de acesso (JWT) e trabalham apenas com os
contratos do usuário logado.

Endpoints:
    POST   /contratos          -> cria um contrato
    GET    /contratos          -> lista os contratos do usuário
    GET    /contratos/{id}     -> dados de um contrato
    PUT    /contratos/{id}     -> salva as alterações de um contrato
    DELETE /contratos/{id}     -> remove um contrato
    GET    /contratos/{id}/pdf -> baixa o contrato em PDF
"""

from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencias import SessaoBanco, UsuarioAtual
from app.esquemas.contrato import ContratoEntrada, ContratoSaida
from app.modelos.contrato import Contrato
from app.rotas.imoveis import buscar_imovel_do_usuario
from app.rotas.inquilinos import buscar_inquilino_do_usuario
from app.servicos.pdf_contrato import gerar_pdf_contrato

router = APIRouter(
    prefix="/contratos",
    tags=["Contratos"],
    responses={401: {"description": "Token de acesso ausente, inválido ou expirado"}},
)


def buscar_contrato_do_usuario(sessao: Session, contrato_id: int, usuario_id: int) -> Contrato:
    """
    Busca um contrato do usuário logado.

    Raises:
        HTTPException 404: contrato inexistente ou de outro usuário.
    """
    contrato = sessao.scalar(
        select(Contrato).where(Contrato.id == contrato_id, Contrato.usuario_id == usuario_id)
    )
    if contrato is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contrato não encontrado.")
    return contrato


def _validar_vinculos(sessao: Session, dados: ContratoEntrada, usuario_id: int) -> None:
    """O inquilino e o imóvel precisam pertencer ao usuário logado (404 caso contrário)."""
    buscar_inquilino_do_usuario(sessao, dados.inquilino_id, usuario_id)
    buscar_imovel_do_usuario(sessao, dados.imovel_id, usuario_id)


@router.post(
    "",
    response_model=ContratoSaida,
    status_code=status.HTTP_201_CREATED,
    summary="Cria um contrato",
    responses={
        404: {"description": "Inquilino ou imóvel não encontrado"},
        422: {"description": "Dados inválidos (vigência, dia de vencimento...)"},
    },
)
def criar_contrato(dados: ContratoEntrada, usuario: UsuarioAtual, sessao: SessaoBanco) -> Contrato:
    """Cadastra um contrato entre o usuário logado e um de seus inquilinos, para um de seus imóveis."""
    _validar_vinculos(sessao, dados, usuario.id)

    contrato = Contrato(usuario_id=usuario.id, **dados.model_dump())
    sessao.add(contrato)
    sessao.commit()
    sessao.refresh(contrato)
    return contrato


@router.get("", response_model=list[ContratoSaida], summary="Lista os contratos do usuário")
def listar_contratos(usuario: UsuarioAtual, sessao: SessaoBanco) -> list[Contrato]:
    """Devolve os contratos do usuário logado, dos mais recentes para os mais antigos."""
    return list(
        sessao.scalars(
            select(Contrato)
            .where(Contrato.usuario_id == usuario.id)
            .order_by(Contrato.data_inicio.desc(), Contrato.id.desc())
        )
    )


@router.get(
    "/{contrato_id}",
    response_model=ContratoSaida,
    summary="Retorna um contrato",
    responses={404: {"description": "Contrato não encontrado"}},
)
def obter_contrato(contrato_id: int, usuario: UsuarioAtual, sessao: SessaoBanco) -> Contrato:
    """Devolve os dados de um contrato do usuário logado."""
    return buscar_contrato_do_usuario(sessao, contrato_id, usuario.id)


@router.put(
    "/{contrato_id}",
    response_model=ContratoSaida,
    summary="Salva as alterações de um contrato",
    responses={
        404: {"description": "Contrato, inquilino ou imóvel não encontrado"},
        422: {"description": "Dados inválidos"},
    },
)
def atualizar_contrato(
    contrato_id: int, dados: ContratoEntrada, usuario: UsuarioAtual, sessao: SessaoBanco
) -> Contrato:
    """Substitui os dados de um contrato do usuário logado (envie o contrato completo)."""
    contrato = buscar_contrato_do_usuario(sessao, contrato_id, usuario.id)
    _validar_vinculos(sessao, dados, usuario.id)

    for campo, valor in dados.model_dump().items():
        setattr(contrato, campo, valor)
    sessao.commit()
    # O refresh também recarrega o inquilino e o imóvel (carregados com JOIN), caso tenham mudado
    sessao.refresh(contrato)
    return contrato


@router.delete(
    "/{contrato_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove um contrato",
    responses={404: {"description": "Contrato não encontrado"}},
)
def remover_contrato(contrato_id: int, usuario: UsuarioAtual, sessao: SessaoBanco) -> None:
    """Exclui um contrato do usuário logado."""
    contrato = buscar_contrato_do_usuario(sessao, contrato_id, usuario.id)
    sessao.delete(contrato)
    sessao.commit()


@router.get(
    "/{contrato_id}/pdf",
    summary="Baixa o contrato em PDF",
    response_class=Response,
    responses={
        200: {"content": {"application/pdf": {}}, "description": "Arquivo PDF do contrato"},
        404: {"description": "Contrato não encontrado"},
    },
)
def baixar_pdf_contrato(contrato_id: int, usuario: UsuarioAtual, sessao: SessaoBanco) -> Response:
    """
    Gera o contrato de locação em PDF a partir dos dados cadastrados.

    O documento usa cláusulas padrão da Lei do Inquilinato e deixa em branco
    os dados que o sistema não guarda (ex.: CPF do locador), para preenchimento
    antes da assinatura.
    """
    contrato = buscar_contrato_do_usuario(sessao, contrato_id, usuario.id)
    arquivo = gerar_pdf_contrato(contrato, usuario)
    return Response(
        content=arquivo,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="contrato-{contrato.id}.pdf"'},
    )
