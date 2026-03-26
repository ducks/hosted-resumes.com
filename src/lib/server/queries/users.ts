import { eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { users, type User, type NewUser } from '$lib/db/schema';

export async function getUserById(id: string): Promise<User | undefined> {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  return db.query.users.findFirst({
    where: eq(users.username, username),
  });
}

export async function createUser(data: NewUser): Promise<User> {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

export async function updateUser(
  id: string,
  data: Partial<Pick<User, 'email' | 'username' | 'displayName' | 'passwordHash' | 'tier' | 'stripeCustomerId' | 'stripeSubscriptionId' | 'subscriptionStatus'>>
): Promise<User | undefined> {
  const [user] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user;
}

export async function deleteUser(id: string): Promise<void> {
  await db.delete(users).where(eq(users.id, id));
}
