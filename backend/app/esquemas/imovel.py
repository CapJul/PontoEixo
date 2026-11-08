"""Esquemas usados nos endpoints de imóveis."""

from datetime import datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, PlainSerializer, StringConstraints

from app.modelos.imovel import StatusImovel, TipoImovel

# Valor em reais: aceita até 2 casas decimais e é devolvido como número no JSON
ValorReais = Annotated[
    Decimal,
    Field(ge=0, max_digits=12, decimal_places=2, examples=[8500.00]),
    PlainSerializer(float, return_type=float),
]

# Vetor de 3 números usado na visualização 3D
Vetor3D = tuple[float, float, float]


class ImovelEntrada(BaseModel):
    """Dados para salvar um imóvel (usados tanto para criar quanto para atualizar)."""

    nome: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=150)] = Field(
        examples=["Padaria Doce Vida"]
    )
    tipo: TipoImovel = Field(description="ponto (ponto comercial), casa ou bloco (galpão)")
    status: StatusImovel = Field(
        default=StatusImovel.DISPONIVEL, description="alugado, disponivel ou manutencao"
    )
    valor_aluguel: ValorReais
    endereco: Annotated[str, StringConstraints(strip_whitespace=True, max_length=255)] | None = Field(
        default=None, examples=["Av. dos Holandeses, 100 - São Luís/MA"]
    )
    latitude: float = Field(ge=-90, le=90, examples=[-2.5564])
    longitude: float = Field(ge=-180, le=180, examples=[-44.0537])
    posicao_3d: Vetor3D | None = Field(
        default=None, description="Posição [x, y, z] no cenário 3D", examples=[[-3, 0, -2]]
    )
    escala_3d: Vetor3D | None = Field(
        default=None,
        description="Tamanho [largura, altura, profundidade] no cenário 3D",
        examples=[[1.5, 1.2, 1.5]],
    )


class ImovelSaida(ImovelEntrada):
    """Imóvel devolvido pela API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    criado_em: datetime
    atualizado_em: datetime


class ImovelResumo(BaseModel):
    """Dados básicos do imóvel, exibidos junto de inquilinos e contratos."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    endereco: str | None
    valor_aluguel: Annotated[Decimal, PlainSerializer(float, return_type=float)]
