"""
Rotas de inquilinos (aba Inquilinos).

Todas as rotas exigem o token de acesso (JWT) e trabalham apenas com os
dados do usuário logado.

Endpoints:
    POST /inquilinos -> cadastra um novo inquilino
"""

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.api.dependencias import SessaoBanco, UsuarioAtual
from app.esquemas.inquilino import InquilinoEntrada, InquilinoSaida
from app.modelos.imovel import Imovel
from app.modelos.inquilino import Inquilino

router = APIRouter(
    prefix="/inquilinos",
    tags=["Inquilinos"],
    responses={401: {"description": "Token de acesso ausente, inválido ou expirado"}},
)

ERRO_DOCUMENTO_DUPLICADO = "Já existe um inquilino cadastrado com este CPF/CNPJ."


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
    if dados.imovel_id is not None:
        imovel_existe = sessao.scalar(
            select(Imovel.id).where(Imovel.id == dados.imovel_id, Imovel.usuario_id == usuario.id)
        )
        if imovel_existe is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Imóvel não encontrado."
            )

    documento_ja_existe = sessao.scalar(
        select(Inquilino.id).where(
            Inquilino.usuario_id == usuario.id, Inquilino.documento == dados.documento
        )
    )
    if documento_ja_existe:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=ERRO_DOCUMENTO_DUPLICADO)

    inquilino = Inquilino(usuario_id=usuario.id, **dados.model_dump())
    sessao.add(inquilino)

    try:
        sessao.commit()
    except IntegrityError as erro:
        # Cadastro simultâneo do mesmo documento: a restrição única do banco barra o segundo
        sessao.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=ERRO_DOCUMENTO_DUPLICADO
        ) from erro

    sessao.refresh(inquilino)
    return inquilino
