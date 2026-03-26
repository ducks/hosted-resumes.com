import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Singleton postgres connection pool (max 10 connections)
const pool = postgres(env.DATABASE_URL, { max: 10 });

// Drizzle instance with schema for typed queries
export const db = drizzle(pool, { schema });

// Raw pool for fallback hand-written SQL if needed
export { pool };
