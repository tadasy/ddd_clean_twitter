# syntax=docker/dockerfile:1
FROM node:20-alpine

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

WORKDIR /app

# ルートのワークスペース定義と web パッケージの package.json
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
# web が依存する workspace パッケージの manifest を追加
COPY packages/api-types/package.json packages/api-types/
# ソースを先にコピーしてから install（node_modules との競合を避ける）
COPY apps/web apps/web

RUN pnpm install --filter web...

WORKDIR /app/apps/web
EXPOSE 5173
CMD ["pnpm", "dev", "--", "--host"]
