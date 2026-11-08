"""
Cria a tabela CONTRATO.

Revisão: 0005
Revisão anterior: 0004
Criada em: 2026-11-08

Guarda os contratos de locação. Regras garantidas pelo banco:
- o dia de vencimento fica entre 1 e 31 e o fim da vigência é depois do início;
- um imóvel ou inquilino com contrato não pode ser excluído (RESTRICT);
- se o usuário for excluído, seus contratos também são.
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

# Identificadores usados pelo Alembic para ordenar as migrações
revision: str = "0005"
down_revision: str | Sequence[str] | None = "0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _enum_texto(*valores: str, nome: str) -> sa.Enum:
    """Enum salvo como texto (VARCHAR) com restrição CHECK."""
    return sa.Enum(*valores, name=nome, native_enum=False, create_constraint=True, length=20)


def upgrade() -> None:
    """Cria a tabela `contrato` e seus índices."""
    op.create_table(
        "contrato",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False,
                  comment="Identificador do contrato"),
        sa.Column("usuario_id", sa.Integer(), nullable=False,
                  comment="Usuário (locador) dono do contrato"),
        sa.Column("inquilino_id", sa.Integer(), nullable=False,
                  comment="Inquilino (locatário) do contrato"),
        sa.Column("imovel_id", sa.Integer(), nullable=False,
                  comment="Imóvel alugado"),
        sa.Column("valor_aluguel", sa.Numeric(precision=12, scale=2), nullable=False,
                  comment="Valor mensal do aluguel, em reais"),
        sa.Column("dia_vencimento", sa.Integer(), nullable=False,
                  comment="Dia do mês em que o aluguel vence (1 a 31)"),
        sa.Column("data_inicio", sa.Date(), nullable=False, comment="Início da vigência"),
        sa.Column("data_fim", sa.Date(), nullable=False, comment="Fim da vigência"),
        sa.Column("indice_reajuste", _enum_texto("ipca", "igpm", "nenhum", nome="indice_reajuste"),
                  nullable=False, comment="ipca, igpm ou nenhum"),
        sa.Column("status",
                  _enum_texto("ativo", "pendente_assinatura", "encerrado", nome="status_contrato"),
                  nullable=False, comment="ativo, pendente_assinatura ou encerrado"),
        sa.Column("observacoes", sa.Text(), nullable=True,
                  comment="Cláusulas ou anotações adicionais"),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False, comment="Data e hora de criação do registro"),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False, comment="Data e hora da última atualização do registro"),
        sa.CheckConstraint("dia_vencimento BETWEEN 1 AND 31",
                           name=op.f("ck_contrato_dia_vencimento_valido")),
        sa.CheckConstraint("data_fim > data_inicio", name=op.f("ck_contrato_vigencia_valida")),
        sa.ForeignKeyConstraint(
            ["usuario_id"], ["usuario.id"],
            name=op.f("fk_contrato_usuario_id_usuario"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["inquilino_id"], ["inquilino.id"],
            name=op.f("fk_contrato_inquilino_id_inquilino"),
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["imovel_id"], ["imovel.id"],
            name=op.f("fk_contrato_imovel_id_imovel"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_contrato")),
    )
    op.create_index(op.f("ix_contrato_usuario_id"), "contrato", ["usuario_id"], unique=False)
    op.create_index(op.f("ix_contrato_inquilino_id"), "contrato", ["inquilino_id"], unique=False)
    op.create_index(op.f("ix_contrato_imovel_id"), "contrato", ["imovel_id"], unique=False)


def downgrade() -> None:
    """Remove os índices e a tabela `contrato`."""
    op.drop_index(op.f("ix_contrato_imovel_id"), table_name="contrato")
    op.drop_index(op.f("ix_contrato_inquilino_id"), table_name="contrato")
    op.drop_index(op.f("ix_contrato_usuario_id"), table_name="contrato")
    op.drop_table("contrato")
