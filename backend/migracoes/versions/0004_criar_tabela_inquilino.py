"""
Cria a tabela INQUILINO.

Revisão: 0004
Revisão anterior: 0003
Criada em: 2026-11-02

Guarda os locatários (PF ou PJ). Regras garantidas pelo banco:
- um mesmo usuário não pode cadastrar o mesmo CPF/CNPJ duas vezes;
- se o imóvel for excluído, o inquilino continua existindo, apenas sem imóvel;
- se o usuário for excluído, seus inquilinos também são.
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

# Identificadores usados pelo Alembic para ordenar as migrações
revision: str = "0004"
down_revision: str | Sequence[str] | None = "0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _enum_texto(*valores: str, nome: str) -> sa.Enum:
    """Enum salvo como texto (VARCHAR) com restrição CHECK."""
    return sa.Enum(*valores, name=nome, native_enum=False, create_constraint=True, length=20)


def upgrade() -> None:
    """Cria a tabela `inquilino` e seus índices."""
    op.create_table(
        "inquilino",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False,
                  comment="Identificador do inquilino"),
        sa.Column("usuario_id", sa.Integer(), nullable=False,
                  comment="Usuário que cadastrou o inquilino"),
        sa.Column("imovel_id", sa.Integer(), nullable=True,
                  comment="Imóvel destinado ao inquilino (opcional)"),
        sa.Column("tipo_pessoa", _enum_texto("PF", "PJ", nome="tipo_pessoa"), nullable=False,
                  comment="PF ou PJ"),
        sa.Column("nome", sa.String(length=200), nullable=False,
                  comment="Nome completo (PF) ou razão social (PJ)"),
        sa.Column("documento", sa.String(length=14), nullable=False,
                  comment="CPF (11) ou CNPJ (14) sem máscara"),
        sa.Column("rg_ou_inscricao_estadual", sa.String(length=30), nullable=True,
                  comment="RG/órgão emissor (PF) ou inscrição estadual (PJ)"),
        sa.Column("data_nascimento", sa.Date(), nullable=True,
                  comment="Data de nascimento (apenas PF)"),
        sa.Column("sexo", _enum_texto("M", "F", "O", nome="sexo"), nullable=True,
                  comment="M, F ou O (apenas PF)"),
        sa.Column("estado_civil",
                  _enum_texto("solteiro", "casado", "divorciado", "viuvo", nome="estado_civil"),
                  nullable=True, comment="Estado civil (apenas PF)"),
        sa.Column("email", sa.String(length=255), nullable=True,
                  comment="E-mail principal"),
        sa.Column("telefone", sa.String(length=11), nullable=True,
                  comment="Celular/WhatsApp com DDD, só números"),
        sa.Column("tipo_locacao",
                  _enum_texto("comercial", "residencial", "temporada", nome="tipo_locacao"),
                  nullable=False, comment="comercial, residencial ou temporada"),
        sa.Column("garantia",
                  _enum_texto("fiador", "caucao", "seguro", "nenhuma", nome="garantia_locaticia"),
                  nullable=True, comment="fiador, caucao, seguro ou nenhuma"),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False, comment="Data e hora de criação do registro"),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False, comment="Data e hora da última atualização do registro"),
        sa.ForeignKeyConstraint(
            ["usuario_id"], ["usuario.id"],
            name=op.f("fk_inquilino_usuario_id_usuario"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["imovel_id"], ["imovel.id"],
            name=op.f("fk_inquilino_imovel_id_imovel"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_inquilino")),
        sa.UniqueConstraint("usuario_id", "documento", name="uq_inquilino_usuario_id_documento"),
    )
    op.create_index(op.f("ix_inquilino_usuario_id"), "inquilino", ["usuario_id"], unique=False)
    op.create_index(op.f("ix_inquilino_imovel_id"), "inquilino", ["imovel_id"], unique=False)


def downgrade() -> None:
    """Remove os índices e a tabela `inquilino`."""
    op.drop_index(op.f("ix_inquilino_imovel_id"), table_name="inquilino")
    op.drop_index(op.f("ix_inquilino_usuario_id"), table_name="inquilino")
    op.drop_table("inquilino")
