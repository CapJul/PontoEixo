"""
Pacote com os modelos (tabelas) do banco de dados.

Todo novo modelo deve ser importado aqui. Assim, ao importar `app.modelos`,
todas as tabelas são registradas em `Base.metadata`, e o Alembic consegue
enxergá-las ao gerar migrações automáticas.
"""

from app.db.base import Base  # noqa: F401
from app.modelos.usuario import Usuario  # noqa: F401
from app.modelos.codigo_recuperacao import CodigoRecuperacao  # noqa: F401
from app.modelos.imovel import Imovel  # noqa: F401
from app.modelos.inquilino import Inquilino  # noqa: F401
from app.modelos.pagamento import Pagamento  # noqa: F401
from app.modelos.contrato import Contrato  # noqa: F401
