import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = postgres(url, { max: 1 });
const db = drizzle(client);

async function main() {
  console.log('running database migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('migrations complete');
  await client.end();
}

main().catch((err) => {
  console.error('migration failed:', err);
  process.exit(1);
});
