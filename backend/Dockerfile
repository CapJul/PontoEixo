# Imagem da API PontoEixo (FastAPI).
# Ao iniciar, aplica as migrações do banco e sobe o servidor na porta 8000.

FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Dependências primeiro, para aproveitar o cache quando só o código mudar
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Roda sem privilégios de root
RUN useradd --create-home --uid 1000 pontoeixo
USER pontoeixo

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000"]
