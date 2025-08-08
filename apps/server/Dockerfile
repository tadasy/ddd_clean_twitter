# syntax=docker/dockerfile:1
FROM node:20-alpine

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

WORKDIR /app

# Copy workspace files for pnpm to resolve
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/server/package.json apps/server/

RUN pnpm install --filter server...

# Copy source
COPY apps/server apps/server

WORKDIR /app/apps/server

EXPOSE 3000
CMD ["pnpm", "dev"]
