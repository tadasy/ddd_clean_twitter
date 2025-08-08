# syntax=docker/dockerfile:1
FROM node:20-alpine

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/

RUN pnpm install --filter web...

COPY apps/web apps/web

WORKDIR /app/apps/web
EXPOSE 5173
CMD ["pnpm", "dev", "--", "--host"]
