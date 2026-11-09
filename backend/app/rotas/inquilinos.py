"""
Rotas de inquilinos (aba Inquilinos).

Todas as rotas exigem o token de acesso (JWT) e trabalham apenas com os
dados do usuário logado.

Endpoints:
    POST   /inquilinos      -> cadastra um novo inquilino
    GET    /inquilinos      -> lista os inquilinos do usuário
    GET    /inquilinos/{id} -> dados de um inquilino
    PUT    /inquilinos/{id} -> salva as alterações de um inquilino
    DELETE /inquilinos/{id} -> remove um inquilino
"""

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencias import SessaoBanco, UsuarioAtual
from app.esquemas.inquilino import InquilinoEntrada, InquilinoSaida
from app.modelos.inquilino import Inquilino
from app.rotas.imoveis import buscar_imovel_do_usuario

router = APIRouter(
    prefix="/inquilinos",
    tags=["Inquilinos"],
    responses={401: {"description": "Token de acesso ausente, inválido ou expirado"}},
)

ERRO_DOCUMENTO_DUPLICADO = "Já existe um inquilino cadastrado com este CPF/CNPJ."


def buscar_inquilino_do_usuario(sessao: Session, inquilino_id: int, usuario_id: int) -> Inquilino:
    """
    Busca um inquilino do usuário logado.

    Raises:
        HTTPException 404: inquilino inexistente ou de outro usuário.
    """
    inquilino = sessao.scalar(
        select(Inquilino).where(Inquilino.id == inquilino_id, Inquilino.usuario_id == usuario_id)
    )
    if inquilino is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquilino não encontrado.")
    return inquilino


def _validar_regras(
    sessao: Session, dados: InquilinoEntrada, usuario_id: int, inquilino_id: int | None = None
) -> None:
    """
    Regras comuns ao cadastro e à edição.

    - se `imovel_id` for informado, o imóvel precisa pertencer ao usuário (404);
    - o mesmo CPF/CNPJ não pode estar em outro inquilino do usuário (409).
    """
    if dados.imovel_id is not None:
        buscar_imovel_do_usuario(sessao, dados.imovel_id, usuario_id)

    consulta = select(Inquilino.id).where(
        Inquilino.usuario_id == usuario_id, Inquilino.documento == dados.documento
    )
    if inquilino_id is not None:
        consulta = consulta.where(Inquilino.id != inquilino_id)
    if sessao.scalar(consulta):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=ERRO_DOCUMENTO_DUPLICADO)


def _salvar(sessao: Session, inquilino: Inquilino) -> Inquilino:
    """Grava no banco tratando o CPF/CNPJ duplicado em requisições simultâneas."""
    try:
        sessao.commit()
    except IntegrityError as erro:
        # A restrição única do banco barra o segundo cadastro do mesmo documento
        sessao.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=ERRO_DOCUMENTO_DUPLICADO
        ) from erro

    sessao.refresh(inquilino)
    return inquilino


@router.post(
    "",
    response_model=InquilinoSaida,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastra um novo inquilino",
    responses={
        404: {"description": "Imóvel informado não encontrado"},
        409: {"description": "CPF/CNPJ já cadastrado para este usuário"},
        422: {"description": "Dados inválidos (CPF/CNPJ, telefone, e-mail...)"},
    },
)
def cadastrar_inquilino(
    dados: InquilinoEntrada, usuario: UsuarioAtual, sessao: SessaoBanco
) -> Inquilino:
    """
    Cadastra um inquilino (PF ou PJ) vinculado ao usuário logado.

    Regras:
    - o CPF/CNPJ é validado pelos dígitos verificadores e salvo sem máscara;
    - o mesmo CPF/CNPJ não pode ser cadastrado duas vezes pelo mesmo usuário;
    - se `imovel_id` for informado, o imóvel precisa pertencer ao usuário.
    """
    _validar_regras(sessao, dados, usuario.id)

    inquilino = Inquilino(usuario_id=usuario.id, **dados.model_dump())
    sessao.add(inquilino)
    return _salvar(sessao, inquilino)


@router.get("", response_model=list[InquilinoSaida], summary="Lista os inquilinos do usuário")
def listar_inquilinos(usuario: UsuarioAtual, sessao: SessaoBanco) -> list[Inquilino]:
    """Devolve todos os inquilinos do usuário logado, ordenados pelo nome, com o imóvel vinculado."""
    return list(
        sessao.scalars(
            select(Inquilino).where(Inquilino.usuario_id == usuario.id).order_by(Inquilino.nome)
        )
    )


@router.get(
    "/{inquilino_id}",
    response_model=InquilinoSaida,
    summary="Retorna um inquilino",
    responses={404: {"description": "Inquilino não encontrado"}},
)
def obter_inquilino(inquilino_id: int, usuario: UsuarioAtual, sessao: SessaoBanco) -> Inquilino:
    """Devolve os dados de um inquilino do usuário logado."""
    return buscar_inquilino_do_usuario(sessao, inquilino_id, usuario.id)


@router.put(
    "/{inquilino_id}",
    response_model=InquilinoSaida,
    summary="Salva as alterações de um inquilino",
    responses={
        404: {"description": "Inquilino ou imóvel não encontrado"},
        409: {"description": "CPF/CNPJ já cadastrado em outro inquilino"},
        422: {"description": "Dados inválidos"},
    },
)
def atualizar_inquilino(
    inquilino_id: int, dados: InquilinoEntrada, usuario: UsuarioAtual, sessao: SessaoBanco
) -> Inquilino:
    """
    Substitui os dados de um inquilino do usuário logado.

    Envie o cadastro completo (mesmo formato do cadastro), com as mesmas regras.
    """
    inquilino = buscar_inquilino_do_usuario(sessao, inquilino_id, usuario.id)
    _validar_regras(sessao, dados, usuario.id, inquilino_id=inquilino.id)

    for campo, valor in dados.model_dump().items():
        setattr(inquilino, campo, valor)
    return _salvar(sessao, inquilino)


@router.delete(
    "/{inquilino_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove um inquilino",
    responses={404: {"description": "Inquilino não encontrado"}},
)
def remover_inquilino(inquilino_id: int, usuario: UsuarioAtual, sessao: SessaoBanco) -> None:
    """Exclui um inquilino do usuário logado."""
    inquilino = buscar_inquilino_do_usuario(sessao, inquilino_id, usuario.id)
    sessao.delete(inquilino)
    sessao.commit()
