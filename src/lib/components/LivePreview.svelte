<script lang="ts">
  import type { JoblResume } from '$lib/jobl/schema';
  import { getTheme, getDefaultTheme, type ThemeEntry } from '$lib/themes';

  let {
    data,
    theme = 'classic',
  }: {
    data: JoblResume | Record<string, unknown>;
    theme?: string;
  } = $props();

  const RESUME_WIDTH = 816; // US Letter at 96dpi

  let containerEl: HTMLDivElement | undefined = $state();
  let containerWidth = $state(0);
  let scaleMode = $state<'fit' | 'full'>('fit');

  const themeEntry = $derived(
    (getTheme(theme) ?? getDefaultTheme()) as ThemeEntry
  );

  const resumeData = $derived.by(() => {
    const d = data as Record<string, unknown>;
    return {
      jobl_version: (d.jobl_version as string) ?? '0.1.0',
      person: (d.person as Record<string, unknown>) ?? { name: '' },
      skills: d.skills,
      experience: d.experience,
      projects: d.projects,
      education: d.education,
    } as JoblResume;
  });

  const personName = $derived(
    (resumeData.person?.name ?? '').trim()
  );

  const scaleFactor = $derived(
    scaleMode === 'full' ? 1 : Math.min(1, containerWidth / RESUME_WIDTH)
  );

  const scaledHeight = $derived(
    scaleMode === 'full' ? 'auto' : `${100 / scaleFactor}%`
  );

  $effect(() => {
    if (!containerEl) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth = entry.contentRect.width;
      }
    });

    observer.observe(containerEl);
    return () => observer.disconnect();
  });
</script>

<div class="live-preview">
  <div class="preview-header">
    <span class="preview-label">Preview</span>
    <div class="scale-toggle">
      <button
        class:active={scaleMode === 'fit'}
        onclick={() => (scaleMode = 'fit')}
      >
        Fit
      </button>
      <button
        class:active={scaleMode === 'full'}
        onclick={() => (scaleMode = 'full')}
      >
        100%
      </button>
    </div>
  </div>
  <div
    class="preview-viewport"
    class:scroll-x={scaleMode === 'full'}
    bind:this={containerEl}
  >
    {#if personName.length === 0}
      <div class="empty-state">
        <p>Start typing to see your resume preview</p>
      </div>
    {/if}
    <div
      class="preview-scaler"
      style:transform="scale({scaleFactor})"
      style:width="{RESUME_WIDTH}px"
      style:height={scaledHeight}
    >
      <themeEntry.component resume={resumeData as any} />
    </div>
  </div>
</div>

<style>
  .live-preview {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #e5e7eb;
  }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.375rem 0.75rem;
    border-bottom: 1px solid var(--color-border, #e5e7eb);
    background: var(--color-surface, #f9fafb);
    flex-shrink: 0;
    font-size: 0.8125rem;
  }

  .preview-label {
    color: var(--color-muted, #6b7280);
    font-weight: 500;
  }

  .scale-toggle {
    display: flex;
    gap: 0;
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 4px;
    overflow: hidden;
  }

  .scale-toggle button {
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border: none;
    background: #ffffff;
    color: var(--color-muted, #6b7280);
    cursor: pointer;
    font-family: inherit;
  }

  .scale-toggle button:not(:last-child) {
    border-right: 1px solid var(--color-border, #e5e7eb);
  }

  .scale-toggle button.active {
    background: var(--color-primary, #2563eb);
    color: #ffffff;
  }

  .preview-viewport {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
  }

  .preview-viewport.scroll-x {
    overflow-x: auto;
  }

  .empty-state {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    pointer-events: none;
  }

  .empty-state p {
    color: var(--color-muted, #6b7280);
    font-size: 0.875rem;
    font-style: italic;
  }

  .preview-scaler {
    transform-origin: top left;
    transition: transform 0.15s ease;
    background: #ffffff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    min-height: 11in;
  }
</style>
