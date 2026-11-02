"""
Cria a tabela IMOVEL.

Revisão: 0003
Revisão anterior: 0002
Criada em: 2026-11-02

Guarda os imóveis exibidos na aba Visão Geral (3D e mapa). Os campos `tipo`
e `status` aceitam apenas os valores listados (restrição CHECK no banco).
Os imóveis são removidos automaticamente se o usuário dono for excluído.
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

# Identificadores usados pelo Alembic para ordenar as migrações
revision: str = "0003"
down_revision: str | Sequence[str] | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Cria a tabela `imovel` e o índice por usuário."""
    op.create_table(
        "imovel",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False,
                  comment="Identificador do imóvel"),
        sa.Column("usuario_id", sa.Integer(), nullable=False,
                  comment="Usuário dono do cadastro do imóvel"),
        sa.Column("nome", sa.String(length=150), nullable=False,
                  comment="Nome de exibição (ex.: Padaria Doce Vida)"),
        sa.Column("tipo",
                  sa.Enum("ponto", "casa", "bloco", name="tipo_imovel",
                          native_enum=False, create_constraint=True, length=20),
                  nullable=False, comment="Formato do imóvel: ponto, casa ou bloco"),
        sa.Column("status",
                  sa.Enum("alugado", "disponivel", "manutencao", name="status_imovel",
                          native_enum=False, create_constraint=True, length=20),
                  nullable=False, comment="Situação: alugado, disponivel ou manutencao"),
        sa.Column("valor_aluguel", sa.Numeric(precision=12, scale=2), nullable=False,
                  comment="Valor mensal do aluguel, em reais"),
        sa.Column("endereco", sa.String(length=255), nullable=True,
                  comment="Endereço do imóvel (opcional)"),
        sa.Column("latitude", sa.Float(), nullable=False,
                  comment="Latitude no mapa geográfico"),
        sa.Column("longitude", sa.Float(), nullable=False,
                  comment="Longitude no mapa geográfico"),
        sa.Column("posicao_3d", sa.JSON(), nullable=True,
                  comment="Posição [x, y, z] na visualização 3D"),
        sa.Column("escala_3d", sa.JSON(), nullable=True,
                  comment="Tamanho [largura, altura, profundidade] na visualização 3D"),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False, comment="Data e hora de criação do registro"),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.func.now(),
                  nullable=False, comment="Data e hora da última atualização do registro"),
        sa.ForeignKeyConstraint(
            ["usuario_id"], ["usuario.id"],
            name=op.f("fk_imovel_usuario_id_usuario"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_imovel")),
    )
    op.create_index(op.f("ix_imovel_usuario_id"), "imovel", ["usuario_id"], unique=False)


def downgrade() -> None:
    """Remove o índice e a tabela `imovel`."""
    op.drop_index(op.f("ix_imovel_usuario_id"), table_name="imovel")
    op.drop_table("imovel")
