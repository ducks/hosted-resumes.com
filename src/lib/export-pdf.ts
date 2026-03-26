// Triggers a PDF download of the given resume by calling the export
// endpoint and streaming the result to a blob download.
export async function downloadResumePdf(
  resumeId: string,
  theme?: string
): Promise<void> {
  const body: Record<string, string> = { resumeId };
  if (theme) {
    body.theme = theme;
  }

  const response = await fetch('/api/export/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      (data as { error?: string }).error ?? `export failed (${response.status})`
    );
  }

  const blob = await response.blob();

  // Extract filename from Content-Disposition, fall back to resume.pdf
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const filenameMatch = disposition.match(/filename="?([^";\n]+)"?/);
  const filename = filenameMatch?.[1] ?? 'resume.pdf';

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
