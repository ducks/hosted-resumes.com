import { eq, desc } from 'drizzle-orm';
import { db } from '$lib/db';
import { resumeVersions, type ResumeVersion } from '$lib/db/schema';

export async function getVersionsByResumeId(
  resumeId: string
): Promise<ResumeVersion[]> {
  return db.query.resumeVersions.findMany({
    where: eq(resumeVersions.resumeId, resumeId),
    orderBy: [desc(resumeVersions.versionNumber)],
  });
}

export async function getVersion(
  resumeId: string,
  versionNumber: number
): Promise<ResumeVersion | undefined> {
  return db.query.resumeVersions.findFirst({
    where: (rv, { and, eq }) =>
      and(eq(rv.resumeId, resumeId), eq(rv.versionNumber, versionNumber)),
  });
}

export async function getLatestVersion(
  resumeId: string
): Promise<ResumeVersion | undefined> {
  return db.query.resumeVersions.findFirst({
    where: eq(resumeVersions.resumeId, resumeId),
    orderBy: [desc(resumeVersions.versionNumber)],
  });
}
