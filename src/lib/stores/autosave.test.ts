import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createAutosave, type SaveStatus } from './autosave';
import { get } from 'svelte/store';

describe('autosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function mockFetch(ok = true, status = 200) {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve({}),
    });
  }

  it('debounces rapid saves', () => {
    mockFetch();
    const as = createAutosave({ resumeId: 'r1', delay: 500 });

    as.save({ a: 1 });
    as.save({ a: 2 });
    as.save({ a: 3 });

    expect(global.fetch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
    );
    expect(body.joblContent).toEqual({ a: 3 });
    as.destroy();
  });

  it('transitions to saving then saved on success', async () => {
    mockFetch();
    const as = createAutosave({ resumeId: 'r1', delay: 100 });
    const states: SaveStatus[] = [];
    as.status.subscribe((s) => states.push(s));

    as.save({ x: 1 });
    vi.advanceTimersByTime(100);

    // Let the fetch promise resolve
    await vi.runAllTimersAsync();

    expect(states).toContain('saving');
    expect(states).toContain('saved');
    as.destroy();
  });

  it('transitions to error on fetch failure', async () => {
    mockFetch(false, 500);
    const as = createAutosave({ resumeId: 'r1', delay: 100 });
    const states: SaveStatus[] = [];
    as.status.subscribe((s) => states.push(s));

    as.save({ x: 1 });
    vi.advanceTimersByTime(100);
    await vi.runAllTimersAsync();

    expect(states).toContain('error');
    as.destroy();
  });

  it('transitions to error on network failure', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('network')
    );
    const as = createAutosave({ resumeId: 'r1', delay: 100 });
    const states: SaveStatus[] = [];
    as.status.subscribe((s) => states.push(s));

    as.save({ x: 1 });
    vi.advanceTimersByTime(100);
    await vi.runAllTimersAsync();

    expect(states).toContain('error');
    as.destroy();
  });

  it('flush sends pending data immediately', async () => {
    mockFetch();
    const as = createAutosave({ resumeId: 'r1', delay: 5000 });

    as.save({ flush: true });
    expect(global.fetch).not.toHaveBeenCalled();

    await as.flush();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    as.destroy();
  });

  it('flush is a no-op when nothing is pending', async () => {
    mockFetch();
    const as = createAutosave({ resumeId: 'r1' });

    await as.flush();

    expect(global.fetch).not.toHaveBeenCalled();
    as.destroy();
  });

  it('sends PUT to correct URL with partial=true', async () => {
    mockFetch();
    const as = createAutosave({ resumeId: 'abc123', delay: 50 });

    as.save({ test: true });
    vi.advanceTimersByTime(50);
    await vi.runAllTimersAsync();

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/resumes/abc123?partial=true',
      expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    as.destroy();
  });

  it('destroy fires pending save', () => {
    mockFetch();
    const as = createAutosave({ resumeId: 'r1', delay: 5000 });

    as.save({ final: true });
    as.destroy();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
