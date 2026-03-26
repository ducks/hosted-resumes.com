import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '$lib/db';

export async function runMigrations() {
  console.log('running database migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('migrations complete');
}
