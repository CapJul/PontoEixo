# Backend PontoEixo (FastAPI)

API do PontoEixo construída com FastAPI, SQLAlchemy e Alembic.

## Estrutura

```
backend/
├── main.py              # Ponto de entrada da API
├── alembic.ini          # Configuração do Alembic
├── migracoes/           # Migrações do banco (ver migracoes/README.md)
└── app/
    ├── api/             # Dependências das rotas (sessão do banco, usuário logado)
    ├── core/            # Configurações (config.py) e segurança (seguranca.py)
    ├── db/              # Base dos modelos e sessão do banco
    ├── esquemas/        # Esquemas Pydantic de entrada e saída
    ├── modelos/         # Modelos (tabelas) do SQLAlchemy (usuario.py, ...)
    └── rotas/           # Endpoints da API, agrupados por assunto
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

## Autenticação

A API usa JWT. Depois do login, envie o token em todas as rotas protegidas:

```
Authorization: Bearer <token_acesso>
```

No Swagger (`/docs`), clique em **Authorize** e cole o `token_acesso`.

| Método | Rota | Protegida | Descrição |
|---|---|---|---|
| POST | `/auth/login` | Não | Login com e-mail e senha; devolve o token |
| GET | `/auth/perfil` | Sim | Dados do usuário logado |
