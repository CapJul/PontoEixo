# Imagem do frontend PontoEixo (Next.js em modo standalone).

# 1) Dependências
FROM node:22-bookworm-slim AS dependencias
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# 2) Build
FROM node:22-bookworm-slim AS build
WORKDIR /app
# Endereço da API usado pelo navegador. Por começar com NEXT_PUBLIC_, é gravado
# no código durante o build: para mudar, gere a imagem de novo.
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencias /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3) Execução: só o servidor gerado pelo build, sem o node_modules completo
FROM node:22-bookworm-slim AS execucao
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
