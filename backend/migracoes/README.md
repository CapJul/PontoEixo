# Migrações do banco de dados

Esta pasta é gerenciada pelo [Alembic](https://alembic.sqlalchemy.org/).

- `env.py`: lê a URL do banco do `.env` e carrega os modelos de `app/modelos`.
- `script.py.mako`: modelo usado para criar novos arquivos de migração.
- `versions/`: uma migração por arquivo, em ordem (`0001_...`, `0002_...`).

## Criando uma nova migração

1. Crie ou altere o modelo em `app/modelos/` e importe-o em `app/modelos/__init__.py`.
2. Gere a migração (dentro de `backend/`), informando o próximo número:

   ```bash
   alembic revision --autogenerate --rev-id 0002 -m "criar tabela exemplo"
   ```

3. **Revise o arquivo gerado** em `versions/`. O autogenerate não detecta tudo
   (por exemplo, renomeação de colunas).
4. Aplique com `alembic upgrade head`.
