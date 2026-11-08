# PontoEixo

Sistema de gestão de imóveis para locação: visão geral dos imóveis em 3D e no mapa, cadastro de inquilinos, contratos com geração de PDF, controle de pagamentos e inadimplência, e relatório para a declaração de imposto de renda.

| Parte | Tecnologias |
|---|---|
| Frontend (`frontend/`) | Next.js 16, React 19, Tailwind CSS 4, three.js (react-three-fiber), Leaflet |
| Backend (`backend/`) | FastAPI, SQLAlchemy 2, Alembic, PostgreSQL, JWT, fpdf2 |

## Rodando com Docker

Pré-requisito: [Docker](https://docs.docker.com/get-docker/) com o Docker Compose.

```bash
docker compose up --build
```

| Endereço | O que é |
|---|---|
| http://localhost:3000 | Aplicação |
| http://localhost:8000/docs | Documentação interativa da API (Swagger) |

Na primeira subida o backend cria as tabelas sozinho (`alembic upgrade head`). Os dados ficam no volume `dados_banco` e continuam lá entre execuções. Para apagar tudo e começar do zero:

```bash
docker compose down -v
```

### Configuração

Os valores padrão já funcionam para testar. Para trocá-los, copie `.env.exemplo` para `.env` na raiz e edite:

- `CHAVE_SECRETA_JWT`: troque fora do ambiente de testes.
- `SMTP_*`: sem SMTP, o código de recuperação de senha não é enviado por e-mail e aparece no log da API:

  ```bash
  docker compose logs backend
  ```

- Endereço da API: o frontend chama a API em `http://localhost:8000`. Esse valor é gravado no build. Para usar outro endereço, mude o argumento `NEXT_PUBLIC_API_URL` no `docker-compose.yml` e a lista `PermissoesBackend` (CORS) do backend, e rode `docker compose up --build` de novo.

## Rodando sem Docker

1. **Banco**: suba um PostgreSQL e crie o banco `pontoeixo`.
2. **Backend**: siga o [`backend/README.md`](backend/README.md).

   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   cp .env.exemplo .env
   alembic upgrade head
   fastapi dev main.py
   ```

3. **Frontend**:

   ```bash
   cd frontend
   npm install
   cp .env.exemplo .env.local
   npm run dev
   ```

## Primeiros passos na aplicação

1. **Conta**: crie uma conta em `/cadastro`.
2. **Imóveis**: cadastre-os em **Visão Geral**, pelo botão "+ Novo imóvel" ou clicando no mapa.
3. **Inquilinos**: cadastre-os em **Inquilinos**.
4. **Contratos**: crie-os em **Contratos** e baixe o PDF.
5. **Pagamentos**: registre os aluguéis recebidos em **Contratos → Pagamentos**. A situação de inadimplência aparece em contratos e inquilinos.
6. **Imposto de Renda**: confira o relatório do ano e informe IPTU, condomínio e taxa de administração em "Despesas Dedutíveis".
