"""
Classe base declarativa dos modelos do SQLAlchemy.

Todo modelo (tabela) do projeto deve herdar de `Base`. O Alembic usa
`Base.metadata` para comparar os modelos com o banco e gerar migrações.
"""

from datetime import datetime

from sqlalchemy import DateTime, MetaData, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# Convenção de nomes para restrições (chaves, índices, unique...).
# Com ela, o Alembic gera nomes previsíveis e iguais em qualquer banco,
# o que facilita escrever migrações de alteração/remoção no futuro.
CONVENCAO_NOMES = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    """Classe mãe de todos os modelos do banco de dados."""

    metadata = MetaData(naming_convention=CONVENCAO_NOMES)


class ColunasDeData:
    """
    Mixin que adiciona as colunas de auditoria `criado_em` e `atualizado_em`.

    Os valores são preenchidos pelo próprio banco (`now()`), então não é
    preciso informá-los ao inserir ou atualizar um registro.
    """

    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Data e hora de criação do registro",
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Data e hora da última atualização do registro",
    )
