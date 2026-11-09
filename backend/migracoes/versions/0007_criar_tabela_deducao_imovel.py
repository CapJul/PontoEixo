"""
Cria a tabela DEDUCAO_IMOVEL.

Revisão: 0007
Revisão anterior: 0006
Criada em: 2026-11-08

Guarda as despesas dedutíveis (IPTU, condomínio e taxa de administração)
pagas pelo locador em cada imóvel, por ano-base. Uma linha por imóvel e ano.
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

# Identificadores usados pelo Alembic para ordenar as migrações
revision: str = "0007"
down_revision: str | Sequence[str] | None = "0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Cria a tabela `deducao_imovel` e seus índices."""
    op.create_table(
        "deducao_imovel",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False,
                  comment="Usuário (locador) que pagou as despesas"),
        sa.Column("imovel_id", sa.Integer(), nullable=False,
                  comment="Imóvel ao qual as despesas se referem"),
        sa.Column("ano", sa.Integer(), nullable=False, comment="Ano-base da declaração"),
        sa.Column("valor_iptu", sa.Numeric(precision=12, scale=2), server_default="0",
                  nullable=False, comment="IPTU pago pelo locador no ano"),
        sa.Column("valor_condominio", sa.Numeric(precision=12, scale=2), server_default="0",
                  nullable=False, comment="Condomínio pago pelo locador no ano"),
        sa.Column("valor_taxa_administracao", sa.Numeric(precision=12, scale=2), server_default="0",
                  nullable=False, comment="Taxa de administração paga à imobiliária no ano"),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False, comment="Data e hora de criação do registro"),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False, comment="Data e hora da última atualização do registro"),
        sa.CheckConstraint(
            "valor_iptu >= 0 AND valor_condominio >= 0 AND valor_taxa_administracao >= 0",
            name=op.f("ck_deducao_imovel_valores_nao_negativos"),
        ),
        sa.ForeignKeyConstraint(
            ["usuario_id"], ["usuario.id"],
            name=op.f("fk_deducao_imovel_usuario_id_usuario"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["imovel_id"], ["imovel.id"],
            name=op.f("fk_deducao_imovel_imovel_id_imovel"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_deducao_imovel")),
        sa.UniqueConstraint("imovel_id", "ano", name="uq_deducao_imovel_imovel_id_ano"),
    )
    op.create_index(op.f("ix_deducao_imovel_usuario_id"), "deducao_imovel", ["usuario_id"], unique=False)
    op.create_index(op.f("ix_deducao_imovel_imovel_id"), "deducao_imovel", ["imovel_id"], unique=False)


def downgrade() -> None:
    """Remove os índices e a tabela `deducao_imovel`."""
    op.drop_index(op.f("ix_deducao_imovel_imovel_id"), table_name="deducao_imovel")
    op.drop_index(op.f("ix_deducao_imovel_usuario_id"), table_name="deducao_imovel")
    op.drop_table("deducao_imovel")
