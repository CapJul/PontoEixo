"""
Pacote com os modelos (tabelas) do banco de dados.

Todo novo modelo deve ser importado aqui. Assim, ao importar `app.modelos`,
todas as tabelas são registradas em `Base.metadata`, e o Alembic consegue
enxergá-las ao gerar migrações automáticas.
"""

from app.db.base import Base  # noqa: F401
