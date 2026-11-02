"""
Configurações centrais da API PontoEixo.

Os valores abaixo são padrões de desenvolvimento. Em qualquer outro ambiente
eles devem ser sobrescritos pelo arquivo `.env` (veja `.env.exemplo`) ou por
variáveis de ambiente com o mesmo nome.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl


class Configuracoes(BaseSettings):
    """Agrupa todas as configurações lidas do ambiente."""

    # ------------------------------------------------------------------
    # Metadados da API (exibidos no Swagger/Redoc)
    # ------------------------------------------------------------------
    NomeProjeto: str = "API PontoEixo"
    VersaoProjeto: str = "0.1.0"
    DescricaoProjeto: str = "API para gerenciamento de software do PontoEixo"
    UrlDocsProjeto: str = "/docs"
    UrlOpenApiProjeto: str = "/openapi.json"
    UrlRedocProjeto: str = "/redoc"

    # Origens autorizadas a chamar a API (CORS)
    PermissoesBackend: list[AnyHttpUrl] = ["http://localhost:3000", "http://localhost:8000"]

    # ------------------------------------------------------------------
    # Banco de dados
    # ------------------------------------------------------------------
    # URL de conexão no formato do SQLAlchemy.
    # Exemplo PostgreSQL: postgresql+psycopg://usuario:senha@localhost:5432/pontoeixo
    UrlBancoDados: str = "postgresql+psycopg://postgres:postgres@localhost:5432/pontoeixo"

    # Quando True, o SQLAlchemy imprime no console todo SQL executado (útil para depuração).
    ExibirSqlNoConsole: bool = False

    # ------------------------------------------------------------------
    # Autenticação (JWT)
    # ------------------------------------------------------------------
    # Chave usada para assinar os tokens. EM PRODUÇÃO, troque por um valor
    # longo e aleatório, por exemplo: python -c "import secrets; print(secrets.token_urlsafe(64))"
    ChaveSecretaJwt: str = "chave-de-desenvolvimento-pontoeixo-troque-em-producao"
    AlgoritmoJwt: str = "HS256"
    # Tempo de validade do token de acesso devolvido no login
    MinutosExpiracaoTokenAcesso: int = 60

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Configuracoes()
