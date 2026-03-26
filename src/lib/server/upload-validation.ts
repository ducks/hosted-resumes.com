const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export function validateUpload(file: File): {
  ok: true;
  ext: string;
} | {
  ok: false;
  status: number;
  error: string;
} {
  const ext = ALLOWED_MIME_TYPES[file.type];
  if (!ext) {
    return {
      ok: false,
      status: 415,
      error: 'unsupported file type, allowed: jpeg, png, webp, gif',
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      status: 413,
      error: 'file too large, max 2 MB',
    };
  }
  return { ok: true, ext };
}

export function buildObjectKey(userId: string, ext: string): string {
  return `${userId}/${crypto.randomUUID()}.${ext}`;
}
