<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().slice(0, 10);
  }

  function resumeName(resume: typeof data.resumes[number]): string {
    const jobl = resume.joblContent as Record<string, unknown> | null;
    if (jobl && typeof jobl === 'object') {
      const person = jobl.person as Record<string, unknown> | undefined;
      if (person && typeof person.name === 'string' && person.name) {
        return person.name;
      }
    }
    return resume.title || 'Untitled';
  }

  const atLimit = $derived(data.resumeCount >= data.maxResumes);

  function confirmDelete(e: MouseEvent) {
    if (!confirm('Delete this resume? This cannot be undone.')) {
      e.preventDefault();
    }
  }
</script>

<svelte:head>
  <title>Dashboard - hosted-resumes.com</title>
</svelte:head>

<div class="dashboard">
  <div class="dashboard-header">
    <h1>Your resumes</h1>
    {#if atLimit}
      <a href="/settings" class="btn btn-disabled">
        Upgrade to Pro for unlimited resumes
      </a>
    {:else}
      <a href="/editor/new" class="btn btn-primary">New resume</a>
    {/if}
  </div>

  {#if data.resumes.length === 0}
    <div class="empty-state">
      <p>You have not created any resumes yet.</p>
      <a href="/editor/new" class="btn btn-primary">
        Create your first resume
      </a>
    </div>
  {:else}
    <div class="resume-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Theme</th>
            <th>Status</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.resumes as resume (resume.id)}
            <tr>
              <td class="name-cell">{resumeName(resume)}</td>
              <td>{resume.theme}</td>
              <td>
                <span class="status" class:published={resume.isPublished}>
                  {resume.isPublished ? 'published' : 'draft'}
                </span>
              </td>
              <td class="date-cell">{formatDate(resume.updatedAt)}</td>
              <td class="actions-cell">
                <a href="/editor/{resume.id}" class="action-link">Edit</a>
                {#if resume.isPublished}
                  <a
                    href="https://{data.user.username}.hosted-resumes.com/{resume.slug}"
                    target="_blank"
                    rel="noopener"
                    class="action-link"
                  >View</a>
                {/if}
                <form method="POST" action="?/delete" use:enhance>
                  <input type="hidden" name="resumeId" value={resume.id} />
                  <button
                    type="submit"
                    class="action-link delete-btn"
                    onclick={confirmDelete}
                  >Delete</button>
                </form>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="resume-cards">
      {#each data.resumes as resume (resume.id)}
        <div class="card">
          <div class="card-header">
            <span class="card-name">{resumeName(resume)}</span>
            <span class="status" class:published={resume.isPublished}>
              {resume.isPublished ? 'published' : 'draft'}
            </span>
          </div>
          <div class="card-meta">
            <span>{resume.theme}</span>
            <span>{formatDate(resume.updatedAt)}</span>
          </div>
          <div class="card-actions">
            <a href="/editor/{resume.id}" class="action-link">Edit</a>
            {#if resume.isPublished}
              <a
                href="https://{data.user.username}.hosted-resumes.com/{resume.slug}"
                target="_blank"
                rel="noopener"
                class="action-link"
              >View</a>
            {/if}
            <form method="POST" action="?/delete" use:enhance>
              <input type="hidden" name="resumeId" value={resume.id} />
              <button
                type="submit"
                class="action-link delete-btn"
                onclick={confirmDelete}
              >Delete</button>
            </form>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }

  .btn {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    font-family: inherit;
    cursor: pointer;
  }

  .btn-primary {
    background: var(--color-primary);
    color: #ffffff;
  }

  .btn-primary:hover {
    opacity: 0.9;
  }

  .btn-disabled {
    background: var(--color-surface);
    color: var(--color-muted);
    border: 1px solid var(--color-border);
  }

  .empty-state {
    text-align: center;
    padding: 4rem 1rem;
    color: var(--color-muted);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .empty-state p {
    margin: 0;
    font-size: 1rem;
  }

  .resume-list {
    display: block;
  }

  .resume-cards {
    display: none;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  thead {
    border-bottom: 2px solid var(--color-border);
  }

  th {
    text-align: left;
    padding: 0.5rem 0.75rem;
    font-weight: 600;
    color: var(--color-muted);
    font-size: 0.8125rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  td {
    padding: 0.75rem;
    border-bottom: 1px solid var(--color-border);
  }

  .name-cell {
    font-weight: 500;
  }

  .date-cell {
    color: var(--color-muted);
  }

  .status {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    background: var(--color-surface);
    color: var(--color-muted);
  }

  .status.published {
    background: #dcfce7;
    color: #166534;
  }

  .actions-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .actions-cell form {
    display: inline;
  }

  .action-link {
    font-size: 0.8125rem;
    color: var(--color-primary);
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
  }

  .action-link:hover {
    text-decoration: underline;
  }

  .delete-btn {
    color: #dc2626;
  }

  .delete-btn:hover {
    color: #b91c1c;
  }

  .card {
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-name {
    font-weight: 500;
  }

  .card-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.8125rem;
    color: var(--color-muted);
  }

  .card-actions {
    display: flex;
    gap: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border);
  }

  .card-actions form {
    display: inline;
  }

  @media (max-width: 768px) {
    .resume-list {
      display: none;
    }

    .resume-cards {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
  }
</style>
