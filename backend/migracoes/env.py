"""
Ambiente de execução do Alembic.

Este arquivo é executado em todo comando `alembic ...`. Ele:
  1. lê a URL do banco a partir das configurações da aplicação (.env);
  2. carrega todos os modelos para que o Alembic conheça as tabelas;
  3. executa as migrações no modo online (conectado ao banco) ou
     offline (apenas gera o SQL, com `alembic upgrade head --sql`).
"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import settings
import app.modelos  # noqa: F401  (registra todas as tabelas em Base.metadata)
from app.db.base import Base

# Objeto de configuração do Alembic (representa o alembic.ini)
configuracao = context.config

# A URL do banco vem do .env, nunca do alembic.ini, para não versionar senhas.
configuracao.set_main_option("sqlalchemy.url", settings.UrlBancoDados)

# Ativa os logs definidos no alembic.ini
if configuracao.config_file_name is not None:
    fileConfig(configuracao.config_file_name)

# Metadados usados pelo `--autogenerate` para comparar modelos x banco
metadados_alvo = Base.metadata


def executar_migracoes_offline() -> None:
    """
    Modo offline: gera os comandos SQL sem conectar ao banco.

    Útil para revisar o SQL ou entregá-lo a quem administra o banco.
    """
    context.configure(
        url=configuracao.get_main_option("sqlalchemy.url"),
        target_metadata=metadados_alvo,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def executar_migracoes_online() -> None:
    """Modo online: conecta ao banco e aplica as migrações diretamente."""
    motor = engine_from_config(
        configuracao.get_section(configuracao.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with motor.connect() as conexao:
        context.configure(
            connection=conexao,
            target_metadata=metadados_alvo,
            compare_type=True,  # detecta também mudanças de tipo de coluna
            render_as_batch=conexao.dialect.name == "sqlite",  # suporte a ALTER no SQLite
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    executar_migracoes_offline()
else:
    executar_migracoes_online()
