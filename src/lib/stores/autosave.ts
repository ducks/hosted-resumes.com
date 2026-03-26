import { writable, type Readable } from 'svelte/store';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface AutosaveOptions {
  resumeId: string;
  delay?: number;
}

export interface Autosave {
  status: Readable<SaveStatus>;
  save: (data: unknown) => void;
  flush: () => Promise<void>;
  destroy: () => void;
}

export function createAutosave(options: AutosaveOptions): Autosave {
  const { resumeId, delay = 1000 } = options;
  const status = writable<SaveStatus>('idle');
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: unknown | null = null;
  let inflight = false;

  async function doSave(data: unknown): Promise<void> {
    inflight = true;
    status.set('saving');
    try {
      const res = await fetch(`/api/resumes/${resumeId}?partial=true`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joblContent: data }),
      });
      if (!res.ok) {
        status.set('error');
      } else {
        status.set('saved');
      }
    } catch {
      status.set('error');
    } finally {
      inflight = false;
    }
  }

  function save(data: unknown): void {
    pending = data;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      const d = pending;
      pending = null;
      doSave(d);
    }, delay);
  }

  async function flush(): Promise<void> {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (pending !== null) {
      const d = pending;
      pending = null;
      await doSave(d);
    }
  }

  function destroy(): void {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    // Fire-and-forget flush on destroy
    if (pending !== null) {
      const d = pending;
      pending = null;
      doSave(d);
    }
  }

  return { status, save, flush, destroy };
}
