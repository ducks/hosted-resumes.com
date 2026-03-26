import { eq, and, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import {
  resumes,
  resumeVersions,
  type Resume,
  type NewResume,
  type ResumeVersion,
} from '$lib/db/schema';

export async function getResumeById(
  id: string,
  userId?: string
): Promise<Resume | undefined> {
  if (userId) {
    return db.query.resumes.findFirst({
      where: and(eq(resumes.id, id), eq(resumes.userId, userId)),
    });
  }
  return db.query.resumes.findFirst({
    where: eq(resumes.id, id),
  });
}

export async function getResumesByUserId(userId: string): Promise<Resume[]> {
  return db.query.resumes.findMany({
    where: eq(resumes.userId, userId),
    orderBy: (resumes, { desc }) => [desc(resumes.updatedAt)],
  });
}

export async function getResumeByUserAndSlug(
  userId: string,
  slug: string
): Promise<Resume | undefined> {
  return db.query.resumes.findFirst({
    where: and(eq(resumes.userId, userId), eq(resumes.slug, slug)),
  });
}

export async function getPublishedResumeByUsernameAndSlug(
  username: string,
  slug: string
): Promise<Resume | undefined> {
  const result = await db
    .select({ resume: resumes })
    .from(resumes)
    .innerJoin(
      sql`users`,
      and(
        sql`users.id = ${resumes.userId}`,
        sql`users.username = ${username}`
      )
    )
    .where(and(eq(resumes.slug, slug), eq(resumes.isPublished, true)))
    .limit(1);
  return result[0]?.resume;
}

export async function createResume(data: NewResume): Promise<Resume> {
  const [resume] = await db.insert(resumes).values(data).returning();
  return resume;
}

// Creates a resume and its initial version (v1) in a single transaction.
export async function createResumeWithVersion(
  data: NewResume
): Promise<{ resume: Resume; version: ResumeVersion }> {
  return db.transaction(async (tx) => {
    const [resume] = await tx.insert(resumes).values(data).returning();
    const [version] = await tx
      .insert(resumeVersions)
      .values({
        resumeId: resume.id,
        versionNumber: 1,
        joblContent: resume.joblContent,
        theme: resume.theme,
        changeDescription: 'initial version',
      })
      .returning();
    return { resume, version };
  });
}

export async function countResumesByUserId(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(resumes)
    .where(eq(resumes.userId, userId));
  return result?.count ?? 0;
}

// Updates resume and optionally creates a version snapshot inside a transaction.
// Uses SELECT FOR UPDATE to prevent race conditions.
// Version is only created when joblContent changes (not theme/publish-only updates).
export async function updateResumeWithVersion(
  id: string,
  userId: string,
  data: Partial<Pick<Resume, 'title' | 'slug' | 'theme' | 'isPublished' | 'joblContent'>>,
  changeDescription?: string
): Promise<{ resume: Resume; version: ResumeVersion | null }> {
  return db.transaction(async (tx) => {
    // Lock the row to prevent concurrent updates
    const [locked] = await tx
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
      .for('update');

    if (!locked) {
      throw new Error('resume not found');
    }

    const dataChanged = data.joblContent !== undefined &&
      JSON.stringify(data.joblContent) !== JSON.stringify(locked.joblContent);

    const [resume] = await tx
      .update(resumes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(resumes.id, id))
      .returning();

    let version: ResumeVersion | null = null;

    if (dataChanged) {
      const [maxResult] = await tx
        .select({ max: sql<number>`coalesce(max(${resumeVersions.versionNumber}), 0)` })
        .from(resumeVersions)
        .where(eq(resumeVersions.resumeId, id));

      const nextVersion = (maxResult?.max ?? 0) + 1;

      [version] = await tx
        .insert(resumeVersions)
        .values({
          resumeId: id,
          versionNumber: nextVersion,
          joblContent: resume.joblContent,
          theme: resume.theme,
          changeDescription,
        })
        .returning();
    }

    return { resume, version };
  });
}

export async function getPublishedResume(
  userId: string
): Promise<Resume | undefined> {
  return db.query.resumes.findFirst({
    where: and(eq(resumes.userId, userId), eq(resumes.isPublished, true)),
    orderBy: (resumes, { desc }) => [desc(resumes.updatedAt)],
  });
}

export async function deleteResume(id: string, userId: string): Promise<void> {
  await db.delete(resumes).where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
}
