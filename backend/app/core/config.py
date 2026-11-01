from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl

class Configuracoes(BaseSettings):
    NomeProjeto: str = "API PontoEixo"
    VersaoProjeto: str = "0.1.0"
    DescricaoProjeto: str = "API para gerenciamento de software do PontoEixo"
    UrlDocsProjeto: str = "/docs"
    UrlOpenApiProjeto: str = "/openapi.json"
    UrlRedocProjeto: str = "/redoc"

    PermissoesBackend: list[AnyHttpUrl] = ["http://localhost:3000", "http://localhost:8000"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Configuracoes()