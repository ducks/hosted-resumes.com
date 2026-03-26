import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres client
const client = postgres(env.DATABASE_URL);

// Create drizzle instance with schema
export const db = drizzle(client, { schema });
