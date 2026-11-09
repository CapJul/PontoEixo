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
    ├── core/            # Configurações, segurança (hash/JWT) e validadores (CPF/CNPJ)
    ├── db/              # Base dos modelos e sessão do banco
    ├── esquemas/        # Esquemas Pydantic de entrada e saída
    ├── modelos/         # Modelos (tabelas) do SQLAlchemy (usuario.py, ...)
    ├── rotas/           # Endpoints da API, agrupados por assunto
    └── servicos/        # Regras de negócio e integrações (envio de e-mail)
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
| POST | `/auth/cadastro` | Não | Cria a conta e já devolve o token |
| POST | `/auth/login` | Não | Login com e-mail e senha; devolve o token |
| GET | `/auth/perfil` | Sim | Dados do usuário logado |
| POST | `/auth/recuperar-senha/solicitar-codigo` | Não | Envia o código de 6 dígitos por e-mail |
| POST | `/auth/recuperar-senha/validar-codigo` | Não | Confere o código e devolve o `token_redefinicao` |
| POST | `/auth/recuperar-senha/redefinir` | Sim (`token_redefinicao`) | Cadastra a nova senha |
| POST | `/imoveis` | Sim | Salva um novo imóvel |
| PUT | `/imoveis/{id}` | Sim | Salva as alterações de um imóvel |
| GET | `/imoveis` | Sim | Lista os imóveis do usuário |
| DELETE | `/imoveis/{id}` | Sim | Remove um imóvel (409 se tiver contratos) |
| POST | `/inquilinos` | Sim | Cadastra um inquilino (PF ou PJ) |
| GET | `/inquilinos` | Sim | Lista os inquilinos do usuário (com o imóvel vinculado) |
| GET | `/inquilinos/{id}` | Sim | Dados de um inquilino |
| PUT | `/inquilinos/{id}` | Sim | Salva as alterações de um inquilino |
| DELETE | `/inquilinos/{id}` | Sim | Remove um inquilino (409 se tiver contratos) |
| POST | `/contratos` | Sim | Cria um contrato de locação |
| GET | `/contratos` | Sim | Lista os contratos do usuário (com inquilino, imóvel e situação financeira) |
| GET | `/contratos/{id}` | Sim | Dados de um contrato |
| PUT | `/contratos/{id}` | Sim | Salva as alterações de um contrato |
| DELETE | `/contratos/{id}` | Sim | Remove um contrato (e seus pagamentos) |
| GET | `/contratos/{id}/pdf` | Sim | Baixa o contrato em PDF |
| POST | `/contratos/{id}/pagamentos` | Sim | Registra um aluguel recebido |
| GET | `/contratos/{id}/pagamentos` | Sim | Lista os pagamentos do contrato |
| DELETE | `/pagamentos/{id}` | Sim | Remove um pagamento |

## Recuperação de senha e e-mail

Configure as variáveis `Smtp*` do `.env` para enviar e-mails de verdade.
Com `SmtpServidor` vazio (padrão em desenvolvimento), o e-mail não é enviado
e o código aparece no console onde a API está rodando.
