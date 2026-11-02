"""
Cria a tabela CODIGO_RECUPERACAO.

Revisão: 0002
Revisão anterior: 0001
Criada em: 2026-11-02

Guarda os códigos de 6 dígitos enviados por e-mail no fluxo de recuperação
de senha. Os códigos são removidos automaticamente se o usuário for excluído.
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

# Identificadores usados pelo Alembic para ordenar as migrações
revision: str = "0002"
down_revision: str | Sequence[str] | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Cria a tabela `codigo_recuperacao` e o índice por usuário."""
    op.create_table(
        "codigo_recuperacao",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False,
                  comment="Identificador do código"),
        sa.Column("usuario_id", sa.Integer(), nullable=False,
                  comment="Usuário que solicitou a recuperação"),
        sa.Column("codigo_hash", sa.String(length=64), nullable=False,
                  comment="Hash HMAC-SHA256 do código enviado"),
        sa.Column("expira_em", sa.DateTime(timezone=True), nullable=False,
                  comment="Momento em que o código deixa de valer"),
        sa.Column("tentativas", sa.Integer(), server_default="0", nullable=False,
                  comment="Quantidade de tentativas erradas de validação"),
        sa.Column("utilizado", sa.Boolean(), server_default=sa.false(), nullable=False,
                  comment="True quando o código já foi usado ou foi invalidado"),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False, comment="Data e hora de envio do código"),
        sa.ForeignKeyConstraint(
            ["usuario_id"], ["usuario.id"],
            name=op.f("fk_codigo_recuperacao_usuario_id_usuario"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_codigo_recuperacao")),
    )
    op.create_index(
        op.f("ix_codigo_recuperacao_usuario_id"), "codigo_recuperacao", ["usuario_id"], unique=False
    )


def downgrade() -> None:
    """Remove o índice e a tabela `codigo_recuperacao`."""
    op.drop_index(op.f("ix_codigo_recuperacao_usuario_id"), table_name="codigo_recuperacao")
    op.drop_table("codigo_recuperacao")
