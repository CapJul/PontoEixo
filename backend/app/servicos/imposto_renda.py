"""
Montagem do relatório de imposto de renda (IRPF) dos aluguéis recebidos.

Regras usadas:
- regime de caixa: entram no ano os aluguéis com `data_pagamento` naquele ano;
- cada inquilino é uma fonte pagadora (PF vai para o carnê-leão, PJ para a
  ficha de rendimentos recebidos de PJ, com o IRRF retido);
- as despesas dedutíveis de um imóvel (IPTU, condomínio, taxa de administração)
  são divididas entre os inquilinos que pagaram aluguel daquele imóvel no ano,
  na proporção do valor pago por cada um, sem ultrapassar esse valor.
"""

from collections import defaultdict
from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal

from app.modelos.inquilino import TipoPessoa

CENTAVO = Decimal("0.01")
ZERO = Decimal("0")


def _arredondar(valor: Decimal) -> Decimal:
    return valor.quantize(CENTAVO, rounding=ROUND_HALF_UP)


@dataclass
class PagamentoIR:
    """Um aluguel recebido no ano, com os dados necessários para o relatório."""

    mes: int
    valor: Decimal
    irrf: Decimal
    inquilino_id: int
    tipo_pessoa: TipoPessoa
    nome: str
    documento: str
    imovel_id: int
    imovel_nome: str


@dataclass
class FonteIR:
    inquilino_id: int
    tipo_pessoa: TipoPessoa
    nome: str
    documento: str
    imoveis: list[str] = field(default_factory=list)
    rendimento_bruto: Decimal = ZERO
    deducoes: Decimal = ZERO
    irrf: Decimal = ZERO
    quantidade_pagamentos: int = 0

    @property
    def rendimento_liquido(self) -> Decimal:
        return self.rendimento_bruto - self.deducoes


@dataclass
class FonteMesIR:
    nome: str
    documento: str
    valor: Decimal


@dataclass
class MesCarneLeao:
    mes: int
    rendimento_bruto: Decimal = ZERO
    fontes: list[FonteMesIR] = field(default_factory=list)


@dataclass
class ResumoIR:
    rendimento_bruto: Decimal
    deducoes: Decimal
    rendimento_liquido: Decimal
    irrf: Decimal


@dataclass
class RelatorioIR:
    ano: int
    resumo: ResumoIR
    fontes: list[FonteIR]
    carne_leao: list[MesCarneLeao]
    deducoes_nao_aproveitadas: Decimal


def _distribuir(total: Decimal, pesos: dict[int, Decimal]) -> dict[int, Decimal]:
    """
    Divide `total` entre as chaves proporcionalmente aos pesos, em centavos,
    sem passar do peso de cada uma. A sobra do arredondamento vai para o maior peso.
    """
    soma = sum(pesos.values(), ZERO)
    if soma <= 0 or total <= 0:
        return {chave: ZERO for chave in pesos}

    distribuir = min(total, soma)
    partes = {chave: _arredondar(distribuir * peso / soma) for chave, peso in pesos.items()}
    sobra = distribuir - sum(partes.values(), ZERO)
    if sobra != 0:
        maior = max(pesos, key=lambda chave: pesos[chave])
        partes[maior] += sobra
    return {chave: min(parte, pesos[chave]) for chave, parte in partes.items()}


def montar_relatorio(
    ano: int, pagamentos: list[PagamentoIR], deducoes_por_imovel: dict[int, Decimal]
) -> RelatorioIR:
    """Agrupa os pagamentos do ano por fonte pagadora e por mês (carnê-leão)."""
    fontes: dict[int, FonteIR] = {}
    recebido_por_imovel: dict[int, dict[int, Decimal]] = defaultdict(lambda: defaultdict(lambda: ZERO))
    meses = {mes: MesCarneLeao(mes=mes) for mes in range(1, 13)}
    pf_por_mes: dict[int, dict[int, Decimal]] = defaultdict(lambda: defaultdict(lambda: ZERO))

    for pagamento in pagamentos:
        fonte = fontes.get(pagamento.inquilino_id)
        if fonte is None:
            fonte = fontes[pagamento.inquilino_id] = FonteIR(
                inquilino_id=pagamento.inquilino_id,
                tipo_pessoa=pagamento.tipo_pessoa,
                nome=pagamento.nome,
                documento=pagamento.documento,
            )
        if pagamento.imovel_nome not in fonte.imoveis:
            fonte.imoveis.append(pagamento.imovel_nome)
        fonte.rendimento_bruto += pagamento.valor
        fonte.irrf += pagamento.irrf
        fonte.quantidade_pagamentos += 1
        recebido_por_imovel[pagamento.imovel_id][pagamento.inquilino_id] += pagamento.valor

        if pagamento.tipo_pessoa == TipoPessoa.PF:
            pf_por_mes[pagamento.mes][pagamento.inquilino_id] += pagamento.valor

    # Deduções de cada imóvel, divididas entre os inquilinos que pagaram por ele
    nao_aproveitadas = ZERO
    for imovel_id, total in deducoes_por_imovel.items():
        recebidos = recebido_por_imovel.get(imovel_id)
        if not recebidos:
            nao_aproveitadas += total
            continue
        partes = _distribuir(total, dict(recebidos))
        nao_aproveitadas += total - sum(partes.values(), ZERO)
        for inquilino_id, parte in partes.items():
            fontes[inquilino_id].deducoes += parte

    # Carnê-leão: rendimentos de pessoas físicas, mês a mês
    for mes, valores in pf_por_mes.items():
        for inquilino_id, valor in valores.items():
            fonte = fontes[inquilino_id]
            meses[mes].fontes.append(FonteMesIR(nome=fonte.nome, documento=fonte.documento, valor=valor))
            meses[mes].rendimento_bruto += valor

    lista_fontes = sorted(fontes.values(), key=lambda f: (f.tipo_pessoa != TipoPessoa.PJ, f.nome))
    bruto = sum((f.rendimento_bruto for f in lista_fontes), ZERO)
    deducoes = sum((f.deducoes for f in lista_fontes), ZERO)
    return RelatorioIR(
        ano=ano,
        resumo=ResumoIR(
            rendimento_bruto=bruto,
            deducoes=deducoes,
            rendimento_liquido=bruto - deducoes,
            irrf=sum((f.irrf for f in lista_fontes), ZERO),
        ),
        fontes=lista_fontes,
        carne_leao=list(meses.values()),
        deducoes_nao_aproveitadas=nao_aproveitadas,
    )
