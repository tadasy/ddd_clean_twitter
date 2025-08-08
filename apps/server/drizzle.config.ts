import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DB_HOST ?? 'db',
    port: Number(process.env.DB_PORT ?? '3306'),
    user: process.env.DB_USER ?? 'app',
    password: process.env.DB_PASSWORD ?? 'password',
    database: process.env.DB_NAME ?? 'ddd_twitter',
  },
} satisfies Config
