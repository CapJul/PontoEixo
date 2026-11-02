"""
Classe base declarativa dos modelos do SQLAlchemy.

Todo modelo (tabela) do projeto deve herdar de `Base`. O Alembic usa
`Base.metadata` para comparar os modelos com o banco e gerar migrações.
"""

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

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
