<script lang="ts">
  import SectionEditor from './SectionEditor.svelte';
  import type { FieldDef } from './fields';

  let {
    title,
    fields,
    items = $bindable([]),
    emptyItem,
    onchange,
  }: {
    title: string;
    fields: FieldDef[];
    items: Record<string, unknown>[];
    emptyItem: () => Record<string, unknown>;
    onchange?: () => void;
  } = $props();

  function addItem() {
    items = [...items, emptyItem()];
    onchange?.();
  }

  function removeItem(index: number) {
    items = items.filter((_, i) => i !== index);
    onchange?.();
  }

  function moveUp(index: number) {
    if (index <= 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    items = next;
    onchange?.();
  }

  function moveDown(index: number) {
    if (index >= items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    items = next;
    onchange?.();
  }

  function itemLabel(item: Record<string, unknown>, index: number): string {
    const primary = item[fields[0]?.key];
    if (typeof primary === 'string' && primary) return primary;
    return `${title} ${index + 1}`;
  }
</script>

<section class="array-section">
  <div class="array-header">
    <h3>{title}</h3>
    <button class="add-btn" onclick={addItem}>+ Add</button>
  </div>

  {#each items as item, index (index)}
    <div class="array-item">
      <div class="item-controls">
        <button
          class="control-btn"
          onclick={() => moveUp(index)}
          disabled={index === 0}
          title="Move up"
        >^</button>
        <button
          class="control-btn"
          onclick={() => moveDown(index)}
          disabled={index === items.length - 1}
          title="Move down"
        >v</button>
        <button
          class="control-btn remove-btn"
          onclick={() => removeItem(index)}
          title="Remove"
        >x</button>
      </div>
      <SectionEditor
        title={itemLabel(item, index)}
        {fields}
        bind:data={items[index]}
        collapsed={true}
        {onchange}
      />
    </div>
  {/each}

  {#if items.length === 0}
    <p class="empty-hint">No entries yet. Click "+ Add" to get started.</p>
  {/if}
</section>

<style>
  .array-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .array-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.25rem 0;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
  }

  .add-btn {
    background: none;
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 4px;
    padding: 0.25rem 0.75rem;
    font-size: 0.8125rem;
    cursor: pointer;
    font-family: inherit;
    color: var(--color-primary, #2563eb);
  }

  .add-btn:hover {
    background: var(--color-surface, #f9fafb);
  }

  .array-item {
    display: flex;
    gap: 0.375rem;
    align-items: flex-start;
  }

  .item-controls {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding-top: 0.5rem;
  }

  .control-btn {
    background: none;
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 3px;
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.75rem;
    cursor: pointer;
    font-family: monospace;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-muted, #6b7280);
  }

  .control-btn:hover:not(:disabled) {
    background: var(--color-surface, #f9fafb);
    color: var(--color-text, #1a1a1a);
  }

  .control-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .remove-btn {
    color: #dc2626;
  }

  .remove-btn:hover:not(:disabled) {
    color: #b91c1c;
    background: #fef2f2;
  }

  .array-item :global(.section-editor) {
    flex: 1;
  }

  .empty-hint {
    font-size: 0.8125rem;
    color: var(--color-muted, #6b7280);
    padding: 1rem 0;
    text-align: center;
    margin: 0;
  }
</style>
