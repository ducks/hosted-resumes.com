import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { uploadFile, getSignedUrl } from '$lib/server/s3';
import { validateUpload, buildObjectKey } from '$lib/server/upload-validation';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: 'invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return json({ error: 'missing file field' }, { status: 400 });
  }

  const validation = validateUpload(file);
  if (!validation.ok) {
    return json(
      { error: validation.error },
      { status: validation.status }
    );
  }

  const key = buildObjectKey(locals.user.id, validation.ext);
  const buffer = Buffer.from(await file.arrayBuffer());

  await uploadFile(key, buffer, file.type);
  const url = await getSignedUrl(key);

  return json(
    { key, url, contentType: file.type, size: file.size },
    { status: 201 }
  );
};

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }

  const key = url.searchParams.get('key');
  if (!key) {
    return json({ error: 'missing key parameter' }, { status: 400 });
  }

  if (!key.startsWith(`${locals.user.id}/`)) {
    return json({ error: 'forbidden' }, { status: 403 });
  }

  const signedUrl = await getSignedUrl(key);
  return json({ url: signedUrl, expiresIn: 3600 });
};
