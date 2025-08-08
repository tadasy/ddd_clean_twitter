# DDD Clean Twitter (Monorepo)

TypeScript + DDD + Clean Architecture sample. Server uses Hono + MySQL, client is Vite React. Managed as a pnpm workspaces monorepo.

## 開発環境 (Docker Compose)

Prerequisites: Docker, Docker Compose

1. 初回起動

```
docker compose up --build
```

- Web: http://localhost:5173
- API: http://localhost:3000

MySQLに初期スキーマを投入します。ホットリロード対応。

## モノレポ構成

- apps/server: Honoサーバー(API)
- apps/web: Vite Reactクライアント
- packages/*: 共通ライブラリ(将来拡張)

## サーバーAPI (一部)

- GET /health
- GET /api/users
- POST /api/users { name, email }

## ローカル(PNPM)で動かす場合

```
pnpm install
pnpm dev
```

