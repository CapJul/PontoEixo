"""Esquemas usados nos endpoints de pagamentos."""

from datetime import date, datetime
from decimal import Decimal
from typing import Annotated, Any, Literal

from pydantic import (
    BaseModel,
    BeforeValidator,
    ConfigDict,
    Field,
    PlainSerializer,
    StringConstraints,
    field_validator,
)

# Valor em reais devolvido como número no JSON
Reais = Annotated[Decimal, PlainSerializer(float, return_type=float)]


def _vazio_para_nulo(valor: Any) -> Any:
    """Converte textos vazios ("" ou só espaços) em None."""
    if isinstance(valor, str) and not valor.strip():
        return None
    return valor


class PagamentoEntrada(BaseModel):
    """Aluguel recebido, informado na tela de pagamentos do contrato."""

    competencia: date = Field(
        description="Mês de referência do aluguel. Qualquer dia do mês é aceito e vira o dia 1.",
        examples=["2026-03-01"],
    )
    valor_pago: Annotated[Decimal, Field(gt=0, max_digits=12, decimal_places=2, examples=[4200.00])]
    data_pagamento: date = Field(examples=["2026-03-05"])
    irrf_retido: Annotated[Decimal, Field(ge=0, max_digits=12, decimal_places=2)] = Field(
        default=Decimal("0"), description="IR retido na fonte (quando o inquilino é PJ)"
    )
    observacao: Annotated[
        Annotated[str, StringConstraints(strip_whitespace=True, max_length=255)] | None,
        BeforeValidator(_vazio_para_nulo),
    ] = None

    @field_validator("competencia")
    @classmethod
    def normalizar_competencia(cls, competencia: date) -> date:
        """Guarda sempre o primeiro dia do mês."""
        return competencia.replace(day=1)


class PagamentoSaida(BaseModel):
    """Pagamento devolvido pela API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    contrato_id: int
    competencia: date
    valor_pago: Reais
    data_pagamento: date
    irrf_retido: Reais
    observacao: str | None
    criado_em: datetime


class SituacaoFinanceiraSaida(BaseModel):
    """Situação de pagamento de um contrato, calculada a partir dos pagamentos."""

    model_config = ConfigDict(from_attributes=True)

    situacao: Literal["em_dia", "inadimplente", "sem_cobranca"] = Field(
        description="sem_cobranca: contrato aguardando assinatura ou encerrado"
    )
    meses_em_aberto: int
    dias_atraso: int = Field(description="Dias desde o vencimento do aluguel mais antigo em aberto")
    competencias_em_aberto: list[date]
