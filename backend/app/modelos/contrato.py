"""
Modelo da tabela CONTRATO.

Representa o contrato de locação entre o usuário (locador) e um inquilino,
referente a um imóvel. É a partir dele que o PontoEixo gera o PDF do
contrato, calcula o próximo reajuste e acompanha os pagamentos.
"""

import enum
from datetime import date
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, Enum, ForeignKey, Integer, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, ColunasDeData
from app.modelos.imovel import Imovel
from app.modelos.inquilino import Inquilino


class IndiceReajuste(str, enum.Enum):
    """Índice usado no reajuste anual do aluguel."""

    IPCA = "ipca"
    IGPM = "igpm"
    NENHUM = "nenhum"


class StatusContrato(str, enum.Enum):
    """Situação do contrato."""

    ATIVO = "ativo"
    PENDENTE_ASSINATURA = "pendente_assinatura"
    ENCERRADO = "encerrado"


def _enum_texto(classe_enum: type[enum.Enum], nome: str) -> Enum:
    """Cria a coluna de enum salva como texto, com restrição CHECK no banco."""
    return Enum(
        classe_enum,
        name=nome,
        native_enum=False,
        length=20,
        create_constraint=True,
        values_callable=lambda classe: [item.value for item in classe],
    )


class Contrato(ColunasDeData, Base):
    """Contrato de locação gerenciado no PontoEixo."""

    __tablename__ = "contrato"
    __table_args__ = (
        CheckConstraint("dia_vencimento BETWEEN 1 AND 31", name="dia_vencimento_valido"),
        CheckConstraint("data_fim > data_inicio", name="vigencia_valida"),
    )

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="Identificador do contrato"
    )
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuario.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Usuário (locador) dono do contrato",
    )
    inquilino_id: Mapped[int] = mapped_column(
        ForeignKey("inquilino.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Inquilino (locatário) do contrato",
    )
    imovel_id: Mapped[int] = mapped_column(
        ForeignKey("imovel.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Imóvel alugado",
    )
    valor_aluguel: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, comment="Valor mensal do aluguel, em reais"
    )
    dia_vencimento: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="Dia do mês em que o aluguel vence (1 a 31)"
    )
    data_inicio: Mapped[date] = mapped_column(Date, nullable=False, comment="Início da vigência")
    data_fim: Mapped[date] = mapped_column(Date, nullable=False, comment="Fim da vigência")
    indice_reajuste: Mapped[IndiceReajuste] = mapped_column(
        _enum_texto(IndiceReajuste, "indice_reajuste"),
        nullable=False,
        default=IndiceReajuste.IPCA,
        comment="ipca, igpm ou nenhum",
    )
    status: Mapped[StatusContrato] = mapped_column(
        _enum_texto(StatusContrato, "status_contrato"),
        nullable=False,
        default=StatusContrato.PENDENTE_ASSINATURA,
        comment="ativo, pendente_assinatura ou encerrado",
    )
    observacoes: Mapped[str | None] = mapped_column(
        Text, nullable=True, comment="Cláusulas ou anotações adicionais"
    )

    # Sempre exibidos junto do contrato (lista, PDF), então vêm no mesmo SELECT
    inquilino: Mapped[Inquilino] = relationship(lazy="joined")
    imovel: Mapped[Imovel] = relationship(lazy="joined")

    def __repr__(self) -> str:
        return f"<Contrato id={self.id} inquilino_id={self.inquilino_id}>"
