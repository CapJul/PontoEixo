"""
Modelo da tabela DEDUCAO_IMOVEL.

Despesas pagas pelo locador em um imóvel, num ano, que podem ser deduzidas
do aluguel recebido na declaração de imposto de renda: IPTU, condomínio e
taxa de administração da imobiliária.
"""

from decimal import Decimal

from sqlalchemy import CheckConstraint, ForeignKey, Integer, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, ColunasDeData


class DeducaoImovel(ColunasDeData, Base):
    """Despesas dedutíveis de um imóvel em um ano-base."""

    __tablename__ = "deducao_imovel"
    __table_args__ = (
        UniqueConstraint("imovel_id", "ano", name="uq_deducao_imovel_imovel_id_ano"),
        CheckConstraint(
            "valor_iptu >= 0 AND valor_condominio >= 0 AND valor_taxa_administracao >= 0",
            name="valores_nao_negativos",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuario.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Usuário (locador) que pagou as despesas",
    )
    imovel_id: Mapped[int] = mapped_column(
        ForeignKey("imovel.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Imóvel ao qual as despesas se referem",
    )
    ano: Mapped[int] = mapped_column(Integer, nullable=False, comment="Ano-base da declaração")
    valor_iptu: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0"), server_default="0",
        comment="IPTU pago pelo locador no ano",
    )
    valor_condominio: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0"), server_default="0",
        comment="Condomínio pago pelo locador no ano",
    )
    valor_taxa_administracao: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False, default=Decimal("0"), server_default="0",
        comment="Taxa de administração paga à imobiliária no ano",
    )

    @property
    def total(self) -> Decimal:
        return self.valor_iptu + self.valor_condominio + self.valor_taxa_administracao
