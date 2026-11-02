# Backend PontoEixo (FastAPI)

API do PontoEixo construída com FastAPI, SQLAlchemy e Alembic.

## Estrutura

```
backend/
├── main.py              # Ponto de entrada da API
├── alembic.ini          # Configuração do Alembic
├── migracoes/           # Migrações do banco (ver migracoes/README.md)
└── app/
    ├── core/            # Configurações gerais (config.py)
    ├── db/              # Base dos modelos e sessão do banco
    └── modelos/         # Modelos (tabelas) do SQLAlchemy (usuario.py, ...)
```

## Como rodar localmente

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Configure o banco
cp .env.exemplo .env       # edite UrlBancoDados se necessário

# Crie/atualize as tabelas
alembic upgrade head

# Suba a API
fastapi dev main.py
```

A documentação interativa fica em http://localhost:8000/docs.
