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

## API 契約変更フロー（TypeSpec → OpenAPI → 型生成）

サーバ/クライアント双方に影響する API の追加・変更は、次の順序で進めます。

1. TypeSpec の編集
   - 変更箇所: `packages/api-spec/src/main.tsp`
   - ポイント:
     - `@service(#{ title, version })` のように値式 `#{}` を使用
     - `@server("<url>", "<desc>")` のシグネチャ順に注意
     - 認証は `@useAuth(BearerAuth)` を利用（独自 `@securityScheme` は不要）
     - モデル/リクエスト/レスポンスを OpenAPI に落ちる形で明示（空オブジェクトは `OkResponse` などを定義）

2. OpenAPI 生成
   - コマンド（コンテナ内）:
     - `docker compose exec web pnpm -C packages/api-spec build`
   - 出力: `packages/api-spec/tsp-output/@typespec/openapi3/openapi.yaml`

3. TypeScript 型生成
   - コマンド（コンテナ内）:
     - `docker compose exec web pnpm -C packages/api-types build`
   - 出力: `packages/api-types/src/index.ts`
   - Web/Server はこのパッケージを `@repo/api-types` として参照します。

4. 実装反映（Server）
   - Presenter/Controller のレスポンス/リクエスト型を生成型に合わせる
   - 例: `import type { components } from '@repo/api-types'`
     - `components['schemas']['Api.CreateUserResponse']` などを利用

5. 実装反映（Web）
   - 既存の手書き型を `@repo/api-types` の生成型へ置換
   - UI 固有の拡張が必要な場合は交差型で拡張（例: `Api.Post & { count?: number }`）

6. 型チェック/動作確認
   - `docker compose exec web pnpm -C apps/web typecheck`
   - `docker compose exec web curl -s http://localhost:3000/health` 等で疎通確認

7. コミット
   - 生成物もバージョン管理します:
     - `packages/api-spec/tsp-output/@typespec/openapi3/openapi.yaml`
     - `packages/api-types/src/index.ts`

> まとめて再生成する場合（ルート）: `pnpm build`（OpenAPI → 型生成の順に実行）

## 日常運用コマンド（抜粋）

- OpenAPI 生成: `docker compose exec web pnpm -C packages/api-spec build`
- 型生成: `docker compose exec web pnpm -C packages/api-types build`
- Web 型チェック: `docker compose exec web pnpm -C apps/web typecheck`
- Server 起動ログ: `docker compose logs -f server`

## よくあるエラーと対処

- TypeSpec: `Is a model expression type, but is being used as a value here`
  - 対処: `@service` などのオブジェクト引数は `#{ ... }` を使う
- TypeSpec: `Unknown decorator @securityScheme`
  - 対処: `@useAuth(BearerAuth)` 等、HTTP ライブラリ既定の認証を使用
- openapi-typescript: `Unsupported schema format, expected openapi: 3.x`
  - 対処: まず OpenAPI 生成が成功しているか確認（先頭が `openapi: 3.0.0`）
- コンテナ内で `@repo/api-types` が解決できない
  - 対処: `docker-compose.yml` で `./packages:/app/packages` を server/web 双方にマウント済みか確認

## 運用 Tips

- 破壊的変更は TypeSpec の `version` を更新し、クライアント更新と同時に反映
- 空レスポンスは `OkResponse { ok: boolean }` を用意して明示
- 生成型へ移行後も、受け入れバリデーションは Zod などで継続

