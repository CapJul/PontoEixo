"""
Modelo da tabela IMOVEL.

Representa cada imóvel (ponto comercial, casa ou galpão) exibido na aba
Visão Geral, tanto na visualização 3D quanto no mapa geográfico.
Cada imóvel pertence ao usuário que o cadastrou.
"""

import enum
from decimal import Decimal

from sqlalchemy import JSON, Enum, Float, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, ColunasDeData


class TipoImovel(str, enum.Enum):
    """Formato do imóvel (define o modelo usado na visualização 3D)."""

    PONTO = "ponto"  # ponto comercial
    CASA = "casa"
    BLOCO = "bloco"  # galpão


class StatusImovel(str, enum.Enum):
    """Situação atual do imóvel (define a cor exibida no frontend)."""

    ALUGADO = "alugado"
    DISPONIVEL = "disponivel"
    MANUTENCAO = "manutencao"


def _valores_enum(classe_enum: type[enum.Enum]) -> list[str]:
    """Faz o banco guardar o valor do enum ('ponto') em vez do nome ('PONTO')."""
    return [item.value for item in classe_enum]


class Imovel(ColunasDeData, Base):
    """Imóvel gerenciado no PontoEixo."""

    __tablename__ = "imovel"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="Identificador do imóvel"
    )
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuario.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Usuário dono do cadastro do imóvel",
    )
    nome: Mapped[str] = mapped_column(
        String(150), nullable=False, comment="Nome de exibição (ex.: Padaria Doce Vida)"
    )
    tipo: Mapped[TipoImovel] = mapped_column(
        Enum(TipoImovel, name="tipo_imovel", native_enum=False, length=20,
             create_constraint=True, values_callable=_valores_enum),
        nullable=False,
        comment="Formato do imóvel: ponto, casa ou bloco",
    )
    status: Mapped[StatusImovel] = mapped_column(
        Enum(StatusImovel, name="status_imovel", native_enum=False, length=20,
             create_constraint=True, values_callable=_valores_enum),
        nullable=False,
        default=StatusImovel.DISPONIVEL,
        comment="Situação: alugado, disponivel ou manutencao",
    )
    valor_aluguel: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, comment="Valor mensal do aluguel, em reais"
    )
    endereco: Mapped[str | None] = mapped_column(
        String(255), nullable=True, comment="Endereço do imóvel (opcional)"
    )
    latitude: Mapped[float] = mapped_column(
        Float, nullable=False, comment="Latitude no mapa geográfico"
    )
    longitude: Mapped[float] = mapped_column(
        Float, nullable=False, comment="Longitude no mapa geográfico"
    )
    posicao_3d: Mapped[list[float] | None] = mapped_column(
        JSON, nullable=True, comment="Posição [x, y, z] na visualização 3D"
    )
    escala_3d: Mapped[list[float] | None] = mapped_column(
        JSON, nullable=True, comment="Tamanho [largura, altura, profundidade] na visualização 3D"
    )

    def __repr__(self) -> str:
        return f"<Imovel id={self.id} nome={self.nome!r}>"
