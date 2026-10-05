import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type Db = ReturnType<typeof create>;

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set. Run "pnpm env:local".');
  return drizzle(postgres(url, { max: 10 }), { schema });
}

/**
 * One pool per process. Next.js re-evaluates route modules on every hot reload,
 * so without this the dev server opens a new pool each time until Postgres
 * refuses connections.
 */
const globalForDb = globalThis as unknown as { bybDb?: Db };

export function db(): Db {
  globalForDb.bybDb ??= create();
  return globalForDb.bybDb;
}
