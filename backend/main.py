from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

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
        allow_origins=[str(origin) for origin in settings.PermissoesBackend],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/", tags=["Saúde da API"])
async def root():
    return {"message": "API PontoEixo está funcionando!"}

