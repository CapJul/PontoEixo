from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.rotas import autenticacao, contratos, imoveis, inquilinos, pagamentos, recuperacao_senha

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Iniciando o aplicativo...")
    yield
    print("Finalizando o aplicativo...")

app = FastAPI(
    title=settings.NomeProjeto,
    version=settings.VersaoProjeto,
    description=settings.DescricaoProjeto,
    docs_url=settings.UrlDocsProjeto,
    openapi_url=settings.UrlOpenApiProjeto,
    redoc_url=settings.UrlRedocProjeto,
    lifespan=lifespan
)

if settings.PermissoesBackend:
    app.add_middleware(
        CORSMiddleware,
        # O Pydantic normaliza a URL com uma barra no final ("http://localhost:3000/"),
        # mas o navegador envia a origem sem ela; por isso a barra é removida.
        allow_origins=[str(origin).rstrip("/") for origin in settings.PermissoesBackend],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Registro das rotas da API
app.include_router(autenticacao.router)
app.include_router(recuperacao_senha.router)
app.include_router(imoveis.router)
app.include_router(inquilinos.router)
app.include_router(contratos.router)
app.include_router(pagamentos.router)

@app.get("/", tags=["Saúde da API"])
async def root():
    return {"message": "API PontoEixo está funcionando!"}

