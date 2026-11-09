"""Esquemas usados nos endpoints de contratos."""

from datetime import date, datetime
from typing import Annotated, Any

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field, StringConstraints, model_validator

from app.esquemas.imovel import ImovelResumo, ValorReais
from app.esquemas.pagamento import SituacaoFinanceiraSaida
from app.modelos.contrato import IndiceReajuste, StatusContrato
from app.modelos.inquilino import TipoPessoa


def _vazio_para_nulo(valor: Any) -> Any:
    """Converte textos vazios ("" ou só espaços) em None."""
    if isinstance(valor, str) and not valor.strip():
        return None
    return valor


class ContratoEntrada(BaseModel):
    """Dados para salvar um contrato (usados tanto para criar quanto para atualizar)."""

    inquilino_id: int = Field(description="Inquilino (locatário) do contrato")
    imovel_id: int = Field(description="Imóvel alugado")
    valor_aluguel: ValorReais
    dia_vencimento: int = Field(ge=1, le=31, description="Dia do mês em que o aluguel vence")
    data_inicio: date = Field(examples=["2026-01-10"])
    data_fim: date = Field(examples=["2029-01-10"])
    indice_reajuste: IndiceReajuste = IndiceReajuste.IPCA
    status: StatusContrato = StatusContrato.PENDENTE_ASSINATURA
    observacoes: Annotated[
        Annotated[str, StringConstraints(strip_whitespace=True, max_length=2000)] | None,
        BeforeValidator(_vazio_para_nulo),
    ] = Field(default=None, description="Cláusulas ou anotações adicionais")

    @model_validator(mode="after")
    def validar_vigencia(self) -> "ContratoEntrada":
        """O fim da vigência precisa ser depois do início."""
        if self.data_fim <= self.data_inicio:
            raise ValueError("A data de término deve ser posterior à data de início.")
        return self


class InquilinoResumo(BaseModel):
    """Dados básicos do inquilino, exibidos junto do contrato."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    tipo_pessoa: TipoPessoa
    documento: str
    telefone: str | None
    email: str | None


class ContratoSaida(BaseModel):
    """Contrato devolvido pela API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    inquilino_id: int
    imovel_id: int
    valor_aluguel: ValorReais
    dia_vencimento: int
    data_inicio: date
    data_fim: date
    indice_reajuste: IndiceReajuste
    status: StatusContrato
    observacoes: str | None
    inquilino: InquilinoResumo
    imovel: ImovelResumo
    situacao_financeira: SituacaoFinanceiraSaida
    criado_em: datetime
    atualizado_em: datetime
