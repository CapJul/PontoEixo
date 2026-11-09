"""
Modelo da tabela PAGAMENTO.

Cada linha é um aluguel recebido, referente a um mês (competência) de um
contrato. É a base para saber quem está em dia e para montar os valores do
imposto de renda.
"""

from datetime import date
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, ColunasDeData


class Pagamento(ColunasDeData, Base):
    """Aluguel recebido em um contrato."""

    __tablename__ = "pagamento"
    __table_args__ = (
        # Cada mês de competência só pode ser pago uma vez por contrato
        UniqueConstraint("contrato_id", "competencia", name="uq_pagamento_contrato_id_competencia"),
        CheckConstraint("valor_pago > 0", name="valor_pago_positivo"),
        CheckConstraint("irrf_retido >= 0", name="irrf_nao_negativo"),
        CheckConstraint("EXTRACT(DAY FROM competencia) = 1", name="competencia_primeiro_dia"),
    )

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="Identificador do pagamento"
    )
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuario.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Usuário (locador) que recebeu o pagamento",
    )
    contrato_id: Mapped[int] = mapped_column(
        ForeignKey("contrato.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Contrato ao qual o aluguel se refere",
    )
    competencia: Mapped[date] = mapped_column(
        Date, nullable=False, comment="Mês de referência do aluguel (sempre o dia 1)"
    )
    valor_pago: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, comment="Valor recebido, em reais"
    )
    data_pagamento: Mapped[date] = mapped_column(
        Date, nullable=False, comment="Data em que o aluguel foi recebido"
    )
    irrf_retido: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0"),
        server_default="0",
        comment="Imposto de renda retido na fonte pelo inquilino PJ",
    )
    observacao: Mapped[str | None] = mapped_column(
        String(255), nullable=True, comment="Anotação livre (ex.: pago com multa)"
    )

    def __repr__(self) -> str:
        return f"<Pagamento id={self.id} contrato_id={self.contrato_id} competencia={self.competencia}>"
