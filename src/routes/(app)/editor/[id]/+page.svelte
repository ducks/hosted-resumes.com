<script lang="ts">
  import { onDestroy } from 'svelte';
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import ResumeEditor from '$lib/editor/ResumeEditor.svelte';
  import DebouncedPreview from '$lib/components/DebouncedPreview.svelte';
  import UpgradeBadge from '$lib/components/UpgradeBadge.svelte';
  import { createAutosave, type SaveStatus } from '$lib/stores/autosave';
  import { canExportPdf } from '$lib/tier';

  let { data }: { data: PageData } = $props();

  let joblContent = $state(
    (data.resume.joblContent as Record<string, unknown>) ?? {
      jobl_version: '0.1.0',
      person: { name: '' },
    }
  );

  let currentTheme = $state(data.resume.theme);
  let previewCollapsed = $state(false);

  const autosave = createAutosave({ resumeId: data.resume.id });
  let statusValue = $state<SaveStatus>('idle');
  const unsubscribe = autosave.status.subscribe((v) => {
    statusValue = v;
  });

  const pdfAllowed = $derived(canExportPdf(data.tier));
  let exporting = $state(false);

  async function exportPdf() {
    if (!pdfAllowed || exporting) return;
    exporting = true;
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: data.resume.id }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (data.resume.title || 'resume') + '.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      exporting = false;
    }
  }

  onDestroy(() => {
    autosave.destroy();
    unsubscribe();
  });

  const statusLabel: Record<SaveStatus, string> = {
    idle: '',
    saving: 'saving...',
    saved: 'saved',
    error: 'save failed',
  };
</script>

<svelte:head>
  <title>Edit - {data.resume.title} - hosted-resumes.com</title>
</svelte:head>

<div class="editor-page">
  <div class="toolbar">
    <a href="/dashboard" class="back-link">Dashboard</a>
    <div class="toolbar-center">
      <form method="POST" action="?/theme" use:enhance={() => {
        return async ({ result, update }) => {
          if (result.type === 'success') {
            currentTheme = (result.data as { theme: string }).theme;
          }
          await update({ reset: false });
        };
      }}>
        <label class="theme-select-label">
          Theme:
          <select name="theme" onchange={(e) => e.currentTarget.form?.requestSubmit()}>
            {#each data.allThemes as theme (theme.id)}
              <option
                value={theme.id}
                selected={theme.id === currentTheme}
                disabled={theme.locked}
              >
                {theme.name}{#if theme.locked} (locked){/if}
              </option>
            {/each}
          </select>
        </label>
      </form>
    </div>
    <div class="toolbar-right">
      {#if pdfAllowed}
        <button
          class="toolbar-btn"
          onclick={exportPdf}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Export PDF'}
        </button>
      {:else}
        <span class="toolbar-btn toolbar-btn-disabled">
          Export PDF <UpgradeBadge requiredTier="pro" />
        </span>
      {/if}
      <button
        class="toggle-preview"
        onclick={() => (previewCollapsed = !previewCollapsed)}
      >
        {previewCollapsed ? 'Show preview' : 'Hide preview'}
      </button>
      <span class="save-status" class:error={statusValue === 'error'}>
        {statusLabel[statusValue]}
      </span>
    </div>
  </div>

  <div class="editor-layout" class:preview-collapsed={previewCollapsed}>
    <div class="editor-panel">
      <ResumeEditor bind:joblContent {autosave} />
    </div>
    {#if !previewCollapsed}
      <div class="preview-panel">
        <DebouncedPreview data={joblContent} theme={currentTheme} />
      </div>
    {/if}
  </div>
</div>

<style>
  .editor-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 4rem);
    margin: -2rem -1.5rem;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--color-border, #e5e7eb);
    background: var(--color-surface, #f9fafb);
    flex-shrink: 0;
  }

  .back-link {
    font-size: 0.8125rem;
    color: var(--color-primary, #2563eb);
    text-decoration: none;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  .toolbar-center {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .theme-select-label {
    font-size: 0.8125rem;
    color: var(--color-muted, #6b7280);
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  select {
    font-size: 0.8125rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 4px;
    font-family: inherit;
    background: #ffffff;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .toolbar-btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 4px;
    background: var(--color-primary, #2563eb);
    color: #ffffff;
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;
  }

  .toolbar-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .toolbar-btn-disabled {
    background: var(--color-surface, #f9fafb);
    color: var(--color-muted, #6b7280);
    cursor: default;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .toggle-preview {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 4px;
    background: #ffffff;
    color: var(--color-muted, #6b7280);
    cursor: pointer;
    font-family: inherit;
  }

  .toggle-preview:hover {
    background: var(--color-surface, #f9fafb);
  }

  .save-status {
    font-size: 0.75rem;
    color: var(--color-muted, #6b7280);
    min-width: 5rem;
    text-align: right;
  }

  .save-status.error {
    color: #dc2626;
  }

  .editor-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    flex: 1;
    overflow: hidden;
    transition: grid-template-columns 0.2s ease;
  }

  .editor-layout.preview-collapsed {
    grid-template-columns: 1fr;
  }

  .editor-panel {
    overflow-y: auto;
    padding: 1.5rem;
    border-right: 1px solid var(--color-border, #e5e7eb);
  }

  .preview-collapsed .editor-panel {
    border-right: none;
  }

  .preview-panel {
    overflow: hidden;
  }

  @media (max-width: 768px) {
    .editor-layout {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr auto;
    }

    .editor-panel {
      border-right: none;
      border-bottom: 1px solid var(--color-border, #e5e7eb);
    }

    .preview-panel {
      max-height: 50vh;
    }
  }
</style>
