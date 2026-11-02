"""
Conexão com o banco de dados e fábrica de sessões.

Uso típico em uma rota do FastAPI:

    from fastapi import Depends
    from sqlalchemy.orm import Session
    from app.db.sessao import obter_sessao

    @router.get("/exemplo")
    def exemplo(sessao: Session = Depends(obter_sessao)):
        ...
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# Motor de conexão único da aplicação.
# `pool_pre_ping` testa a conexão antes de usá-la, evitando erros quando o
# banco derruba conexões ociosas.
motor = create_engine(
    settings.UrlBancoDados,
    echo=settings.ExibirSqlNoConsole,
    pool_pre_ping=True,
)

# Fábrica de sessões. Cada requisição recebe a sua própria sessão.
FabricaSessao = sessionmaker(bind=motor, autoflush=False, expire_on_commit=False)


def obter_sessao() -> Generator[Session, None, None]:
    """
    Dependência do FastAPI que entrega uma sessão do banco por requisição.

    A sessão é sempre fechada ao final, mesmo se ocorrer um erro.
    O commit fica a cargo de quem usa a sessão.
    """
    sessao = FabricaSessao()
    try:
        yield sessao
    finally:
        sessao.close()
