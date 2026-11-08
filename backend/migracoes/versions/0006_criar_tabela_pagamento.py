"""
Cria a tabela PAGAMENTO.

Revisão: 0006
Revisão anterior: 0005
Criada em: 2026-11-08

Guarda os aluguéis recebidos. Regras garantidas pelo banco:
- cada mês de competência só pode ser pago uma vez por contrato;
- a competência é sempre o dia 1 do mês;
- o valor pago é positivo e o IRRF retido não é negativo;
- se o contrato (ou o usuário) for excluído, seus pagamentos também são.
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

# Identificadores usados pelo Alembic para ordenar as migrações
revision: str = "0006"
down_revision: str | Sequence[str] | None = "0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Cria a tabela `pagamento` e seus índices."""
    op.create_table(
        "pagamento",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False,
                  comment="Identificador do pagamento"),
        sa.Column("usuario_id", sa.Integer(), nullable=False,
                  comment="Usuário (locador) que recebeu o pagamento"),
        sa.Column("contrato_id", sa.Integer(), nullable=False,
                  comment="Contrato ao qual o aluguel se refere"),
        sa.Column("competencia", sa.Date(), nullable=False,
                  comment="Mês de referência do aluguel (sempre o dia 1)"),
        sa.Column("valor_pago", sa.Numeric(precision=12, scale=2), nullable=False,
                  comment="Valor recebido, em reais"),
        sa.Column("data_pagamento", sa.Date(), nullable=False,
                  comment="Data em que o aluguel foi recebido"),
        sa.Column("irrf_retido", sa.Numeric(precision=12, scale=2), server_default="0",
                  nullable=False, comment="Imposto de renda retido na fonte pelo inquilino PJ"),
        sa.Column("observacao", sa.String(length=255), nullable=True,
                  comment="Anotação livre (ex.: pago com multa)"),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False, comment="Data e hora de criação do registro"),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False, comment="Data e hora da última atualização do registro"),
        sa.CheckConstraint("valor_pago > 0", name=op.f("ck_pagamento_valor_pago_positivo")),
        sa.CheckConstraint("irrf_retido >= 0", name=op.f("ck_pagamento_irrf_nao_negativo")),
        sa.CheckConstraint("EXTRACT(DAY FROM competencia) = 1",
                           name=op.f("ck_pagamento_competencia_primeiro_dia")),
        sa.ForeignKeyConstraint(
            ["usuario_id"], ["usuario.id"],
            name=op.f("fk_pagamento_usuario_id_usuario"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["contrato_id"], ["contrato.id"],
            name=op.f("fk_pagamento_contrato_id_contrato"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_pagamento")),
        sa.UniqueConstraint("contrato_id", "competencia", name="uq_pagamento_contrato_id_competencia"),
    )
    op.create_index(op.f("ix_pagamento_usuario_id"), "pagamento", ["usuario_id"], unique=False)
    op.create_index(op.f("ix_pagamento_contrato_id"), "pagamento", ["contrato_id"], unique=False)


def downgrade() -> None:
    """Remove os índices e a tabela `pagamento`."""
    op.drop_index(op.f("ix_pagamento_contrato_id"), table_name="pagamento")
    op.drop_index(op.f("ix_pagamento_usuario_id"), table_name="pagamento")
    op.drop_table("pagamento")
