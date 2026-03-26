<script lang="ts">
  import type { FieldDef } from './fields';

  let {
    title,
    fields,
    data = $bindable({}),
    collapsed = false,
    onchange,
  }: {
    title: string;
    fields: FieldDef[];
    data: Record<string, unknown>;
    collapsed?: boolean;
    onchange?: () => void;
  } = $props();

  let open = $state(!collapsed);

  function handleInput(key: string, value: unknown) {
    data[key] = value;
    onchange?.();
  }

  function parseTags(value: string): string[] {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function formatTags(arr: unknown): string {
    if (!Array.isArray(arr)) return '';
    return arr.join(', ');
  }
</script>

<section class="section-editor">
  <button class="section-toggle" onclick={() => (open = !open)}>
    <span class="toggle-icon">{open ? '-' : '+'}</span>
    <h3>{title}</h3>
  </button>

  {#if open}
    <div class="section-fields">
      {#each fields as field (field.key)}
        <div class="field">
          <label for="field-{field.key}">{field.label}</label>
          {#if field.type === 'textarea'}
            <textarea
              id="field-{field.key}"
              value={(typeof data[field.key] === 'string' ? data[field.key] : '') as string}
              placeholder={field.placeholder}
              oninput={(e) => handleInput(field.key, e.currentTarget.value)}
              rows="3"
            ></textarea>
          {:else if field.type === 'tags'}
            <input
              id="field-{field.key}"
              type="text"
              value={formatTags(data[field.key]) as string}
              placeholder={field.placeholder}
              oninput={(e) => handleInput(field.key, parseTags(e.currentTarget.value))}
            />
            <span class="field-hint">Comma-separated</span>
          {:else}
            <input
              id="field-{field.key}"
              type={field.type === 'date' ? 'text' : field.type}
              value={typeof data[field.key] === 'string' ? data[field.key] : ''}
              placeholder={field.placeholder}
              oninput={(e) => handleInput(field.key, e.currentTarget.value)}
            />
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .section-editor {
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 6px;
    overflow: hidden;
  }

  .section-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: var(--color-surface, #f9fafb);
    border: none;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
  }

  .section-toggle:hover {
    background: #f3f4f6;
  }

  .toggle-icon {
    font-family: monospace;
    font-size: 1rem;
    width: 1rem;
    text-align: center;
    color: var(--color-muted, #6b7280);
  }

  h3 {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .section-fields {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-muted, #6b7280);
  }

  input,
  textarea {
    padding: 0.5rem 0.625rem;
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 4px;
    font-size: 0.875rem;
    font-family: inherit;
    background: #ffffff;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--color-primary, #2563eb);
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
  }

  textarea {
    resize: vertical;
  }

  .field-hint {
    font-size: 0.75rem;
    color: var(--color-muted, #6b7280);
  }
</style>
