"""
Cálculo da situação financeira (em dia ou inadimplente) de um contrato.

Regra: cada mês de vigência gera um aluguel com vencimento no dia
`dia_vencimento` (ou no último dia do mês, se ele não existir). Um aluguel
está em atraso quando a data de vencimento já passou, está dentro da
vigência e não há pagamento registrado para aquela competência.
"""

import calendar
from collections.abc import Iterable
from dataclasses import dataclass, field
from datetime import date


@dataclass
class SituacaoFinanceira:
    """Resultado do cálculo, devolvido junto de cada contrato."""

    situacao: str  # "em_dia", "inadimplente" ou "sem_cobranca"
    meses_em_aberto: int = 0
    dias_atraso: int = 0
    competencias_em_aberto: list[date] = field(default_factory=list)


def data_vencimento(competencia: date, dia_vencimento: int) -> date:
    """Vencimento do aluguel de uma competência (dia limitado ao fim do mês)."""
    ultimo_dia = calendar.monthrange(competencia.year, competencia.month)[1]
    return competencia.replace(day=min(dia_vencimento, ultimo_dia))


def proximo_mes(competencia: date) -> date:
    if competencia.month == 12:
        return date(competencia.year + 1, 1, 1)
    return date(competencia.year, competencia.month + 1, 1)


def competencias_vencidas(
    dia_vencimento: int, data_inicio: date, data_fim: date, hoje: date
) -> list[date]:
    """Competências (dia 1 de cada mês) cujo vencimento já passou dentro da vigência."""
    vencidas = []
    competencia = data_inicio.replace(day=1)
    while competencia <= data_fim:
        vencimento = data_vencimento(competencia, dia_vencimento)
        if vencimento >= hoje:
            break
        if data_inicio <= vencimento <= data_fim:
            vencidas.append(competencia)
        competencia = proximo_mes(competencia)
    return vencidas


def calcular_situacao(
    ativo: bool,
    dia_vencimento: int,
    data_inicio: date,
    data_fim: date,
    competencias_pagas: Iterable[date],
    hoje: date | None = None,
) -> SituacaoFinanceira:
    """
    Calcula a situação de um contrato.

    Contratos que não estão ativos (aguardando assinatura ou encerrados) não
    geram cobrança e ficam como `sem_cobranca`.
    """
    if not ativo:
        return SituacaoFinanceira(situacao="sem_cobranca")

    hoje = hoje or date.today()
    pagas = set(competencias_pagas)
    em_aberto = [
        c for c in competencias_vencidas(dia_vencimento, data_inicio, data_fim, hoje) if c not in pagas
    ]

    if not em_aberto:
        return SituacaoFinanceira(situacao="em_dia")

    vencimento_mais_antigo = data_vencimento(em_aberto[0], dia_vencimento)
    return SituacaoFinanceira(
        situacao="inadimplente",
        meses_em_aberto=len(em_aberto),
        dias_atraso=(hoje - vencimento_mais_antigo).days,
        competencias_em_aberto=em_aberto,
    )
