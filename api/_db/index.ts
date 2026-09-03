import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema.js'

const isProd = process.env.NODE_ENV === 'production'

const databaseUrl = process.env.DATABASE_URL
  ?? (isProd
    ? undefined
    : 'postgresql://postgres:postgres@localhost:5432/study_center?sslmode=disable')

if (!databaseUrl && isProd) {
  throw new Error('DATABASE_URL is not set')
}

const pool = new Pool({ connectionString: databaseUrl })
export const db = drizzle(pool, { schema })

export function getDbUrlForLogs() {
  return databaseUrl
}
