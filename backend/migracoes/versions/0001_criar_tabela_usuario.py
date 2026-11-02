"""
Cria a tabela USUARIO.

Revisão: 0001
Revisão anterior: nenhuma (primeira migração)
Criada em: 2026-11-02

A tabela guarda as contas de acesso ao sistema. O e-mail é único e indexado,
pois é a chave usada no login.
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

# Identificadores usados pelo Alembic para ordenar as migrações
revision: str = "0001"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Cria a tabela `usuario` e o índice único do e-mail."""
    op.create_table(
        "usuario",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False,
                  comment="Identificador do usuário"),
        sa.Column("nome", sa.String(length=150), nullable=False,
                  comment="Nome completo do usuário"),
        sa.Column("email", sa.String(length=255), nullable=False,
                  comment="E-mail usado no login (sempre em minúsculas)"),
        sa.Column("senha_hash", sa.String(length=255), nullable=False,
                  comment="Hash da senha do usuário"),
        sa.Column("ativo", sa.Boolean(), server_default=sa.true(), nullable=False,
                  comment="Indica se o usuário pode acessar o sistema"),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False, comment="Data e hora de criação do registro"),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False, comment="Data e hora da última atualização do registro"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_usuario")),
    )
    op.create_index(op.f("ix_usuario_email"), "usuario", ["email"], unique=True)


def downgrade() -> None:
    """Remove o índice e a tabela `usuario`."""
    op.drop_index(op.f("ix_usuario_email"), table_name="usuario")
    op.drop_table("usuario")
