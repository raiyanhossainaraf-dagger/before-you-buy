import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '../../.env.local', quiet: true });

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './migrations',
  dbCredentials: {
    // Migrations and studio use the direct (unpooled) connection.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? '',
  },
  strict: true,
  verbose: true,
});
