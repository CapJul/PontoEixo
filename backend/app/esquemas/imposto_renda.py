"""Esquemas usados nos endpoints de imposto de renda."""

from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, PlainSerializer

from app.modelos.inquilino import TipoPessoa

# Valor em reais devolvido como número no JSON
Reais = Annotated[Decimal, PlainSerializer(float, return_type=float)]
ValorDeducao = Annotated[Decimal, Field(ge=0, max_digits=12, decimal_places=2)]


class ResumoSaida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    rendimento_bruto: Reais
    deducoes: Reais
    rendimento_liquido: Reais
    irrf: Reais


class FonteSaida(BaseModel):
    """Fonte pagadora (inquilino) com os valores do ano."""

    model_config = ConfigDict(from_attributes=True)

    inquilino_id: int
    tipo_pessoa: TipoPessoa
    nome: str
    documento: str = Field(description="CPF ou CNPJ sem máscara")
    imoveis: list[str]
    rendimento_bruto: Reais
    deducoes: Reais
    rendimento_liquido: Reais
    irrf: Reais
    quantidade_pagamentos: int


class FonteMesSaida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    nome: str
    documento: str
    valor: Reais


class MesCarneLeaoSaida(BaseModel):
    """Rendimentos recebidos de pessoas físicas em um mês (carnê-leão)."""

    model_config = ConfigDict(from_attributes=True)

    mes: int = Field(ge=1, le=12)
    rendimento_bruto: Reais
    fontes: list[FonteMesSaida]


class RelatorioSaida(BaseModel):
    """Relatório anual de IRPF dos aluguéis recebidos."""

    model_config = ConfigDict(from_attributes=True)

    ano: int
    titular: str
    anos_disponiveis: list[int] = Field(description="Anos com pagamentos registrados (e o ano atual)")
    resumo: ResumoSaida
    fontes: list[FonteSaida]
    carne_leao: list[MesCarneLeaoSaida]
    deducoes_nao_aproveitadas: Reais = Field(
        description="Deduções de imóveis sem aluguel recebido no ano (não entram no relatório)"
    )


class DeducaoEntrada(BaseModel):
    """Despesas dedutíveis pagas pelo locador em um imóvel no ano."""

    valor_iptu: ValorDeducao = Decimal("0")
    valor_condominio: ValorDeducao = Decimal("0")
    valor_taxa_administracao: ValorDeducao = Decimal("0")


class DeducaoSaida(BaseModel):
    """Despesas dedutíveis de um imóvel (zeradas quando ainda não informadas)."""

    imovel_id: int
    imovel_nome: str
    ano: int
    valor_iptu: Reais
    valor_condominio: Reais
    valor_taxa_administracao: Reais
