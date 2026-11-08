"""
Rotas de imposto de renda (aba Imposto de Renda).

Todas as rotas exigem o token de acesso (JWT) e usam apenas os dados do
usuário logado.

Endpoints:
    GET /imposto-de-renda/{ano}                      -> relatório anual (fontes e carnê-leão)
    GET /imposto-de-renda/{ano}/deducoes             -> despesas dedutíveis por imóvel
    PUT /imposto-de-renda/{ano}/deducoes/{imovel_id} -> salva as despesas de um imóvel
"""

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Path
from sqlalchemy import extract, select

from app.api.dependencias import SessaoBanco, UsuarioAtual
from app.esquemas.imposto_renda import DeducaoEntrada, DeducaoSaida, RelatorioSaida
from app.modelos.contrato import Contrato
from app.modelos.deducao_imovel import DeducaoImovel
from app.modelos.imovel import Imovel
from app.modelos.inquilino import Inquilino
from app.modelos.pagamento import Pagamento
from app.rotas.imoveis import buscar_imovel_do_usuario
from app.servicos.imposto_renda import PagamentoIR, montar_relatorio

router = APIRouter(
    prefix="/imposto-de-renda",
    tags=["Imposto de Renda"],
    responses={401: {"description": "Token de acesso ausente, inválido ou expirado"}},
)

AnoBase = Annotated[int, Path(ge=2000, le=2100, description="Ano-base da declaração")]


@router.get("/{ano}", response_model=RelatorioSaida, summary="Relatório anual de IRPF")
def relatorio_anual(ano: AnoBase, usuario: UsuarioAtual, sessao: SessaoBanco) -> RelatorioSaida:
    """
    Monta o relatório dos aluguéis recebidos no ano (pela data do pagamento).

    Traz os totais do ano, uma fonte pagadora por inquilino (com o IRRF
    retido pelos PJ) e os rendimentos recebidos de pessoas físicas mês a mês,
    que alimentam o carnê-leão.
    """
    linhas = sessao.execute(
        select(Pagamento, Inquilino, Imovel)
        .join(Contrato, Pagamento.contrato_id == Contrato.id)
        .join(Inquilino, Contrato.inquilino_id == Inquilino.id)
        .join(Imovel, Contrato.imovel_id == Imovel.id)
        .where(Pagamento.usuario_id == usuario.id, extract("year", Pagamento.data_pagamento) == ano)
    ).all()

    pagamentos = [
        PagamentoIR(
            mes=pagamento.data_pagamento.month,
            valor=pagamento.valor_pago,
            irrf=pagamento.irrf_retido,
            inquilino_id=inquilino.id,
            tipo_pessoa=inquilino.tipo_pessoa,
            nome=inquilino.nome,
            documento=inquilino.documento,
            imovel_id=imovel.id,
            imovel_nome=imovel.nome,
        )
        for pagamento, inquilino, imovel in linhas
    ]

    deducoes = sessao.scalars(
        select(DeducaoImovel).where(DeducaoImovel.usuario_id == usuario.id, DeducaoImovel.ano == ano)
    )
    relatorio = montar_relatorio(ano, pagamentos, {d.imovel_id: d.total for d in deducoes})

    anos_com_pagamento = sessao.scalars(
        select(extract("year", Pagamento.data_pagamento).label("ano"))
        .where(Pagamento.usuario_id == usuario.id)
        .distinct()
    )
    anos = sorted({int(a) for a in anos_com_pagamento} | {date.today().year, ano}, reverse=True)

    return RelatorioSaida.model_validate(
        {**relatorio.__dict__, "titular": usuario.nome, "anos_disponiveis": anos}
    )


@router.get(
    "/{ano}/deducoes",
    response_model=list[DeducaoSaida],
    summary="Despesas dedutíveis de cada imóvel no ano",
)
def listar_deducoes(ano: AnoBase, usuario: UsuarioAtual, sessao: SessaoBanco) -> list[DeducaoSaida]:
    """Lista todos os imóveis do usuário com as despesas informadas no ano (zero quando não informadas)."""
    imoveis = sessao.scalars(select(Imovel).where(Imovel.usuario_id == usuario.id).order_by(Imovel.nome))
    deducoes = {
        d.imovel_id: d
        for d in sessao.scalars(
            select(DeducaoImovel).where(DeducaoImovel.usuario_id == usuario.id, DeducaoImovel.ano == ano)
        )
    }
    resultado = []
    for imovel in imoveis:
        deducao = deducoes.get(imovel.id)
        resultado.append(
            DeducaoSaida(
                imovel_id=imovel.id,
                imovel_nome=imovel.nome,
                ano=ano,
                valor_iptu=deducao.valor_iptu if deducao else 0,
                valor_condominio=deducao.valor_condominio if deducao else 0,
                valor_taxa_administracao=deducao.valor_taxa_administracao if deducao else 0,
            )
        )
    return resultado


@router.put(
    "/{ano}/deducoes/{imovel_id}",
    response_model=DeducaoSaida,
    summary="Salva as despesas dedutíveis de um imóvel no ano",
    responses={404: {"description": "Imóvel não encontrado"}},
)
def salvar_deducao(
    ano: AnoBase, imovel_id: int, dados: DeducaoEntrada, usuario: UsuarioAtual, sessao: SessaoBanco
) -> DeducaoSaida:
    """Cria ou substitui o IPTU, o condomínio e a taxa de administração pagos pelo locador no ano."""
    imovel = buscar_imovel_do_usuario(sessao, imovel_id, usuario.id)

    deducao = sessao.scalar(
        select(DeducaoImovel).where(DeducaoImovel.imovel_id == imovel.id, DeducaoImovel.ano == ano)
    )
    if deducao is None:
        deducao = DeducaoImovel(usuario_id=usuario.id, imovel_id=imovel.id, ano=ano)
        sessao.add(deducao)
    for campo, valor in dados.model_dump().items():
        setattr(deducao, campo, valor)
    sessao.commit()

    return DeducaoSaida(
        imovel_id=imovel.id,
        imovel_nome=imovel.nome,
        ano=ano,
        valor_iptu=deducao.valor_iptu,
        valor_condominio=deducao.valor_condominio,
        valor_taxa_administracao=deducao.valor_taxa_administracao,
    )
