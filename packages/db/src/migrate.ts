import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

config({ path: '../../.env.local', quiet: true });

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL_UNPOOLED is not set. Run "pnpm env:local".');
  process.exit(1);
}

// max: 1 — a migration runner must not interleave statements across connections.
const sql = postgres(url, { max: 1 });

try {
  await migrate(drizzle(sql), { migrationsFolder: './migrations' });
  console.log('Migrations applied.');
} finally {
  await sql.end();
}
