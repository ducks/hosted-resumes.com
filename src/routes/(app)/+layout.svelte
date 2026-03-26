<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<div class="app">
  <header>
    <nav>
      <a href="/dashboard" class="brand">hosted-resumes.com</a>
      <div class="nav-links">
        <a href="/dashboard">Dashboard</a>
        <a href="/settings">Settings</a>
      </div>
      <div class="nav-user">
        <span class="user-email">{data.user.email}</span>
        <form method="POST" action="/api/auth/logout" use:enhance={() => {
          return async () => {
            window.location.href = '/';
          };
        }}>
          <button type="submit" class="logout-btn">Log out</button>
        </form>
      </div>
    </nav>
  </header>

  <main>
    {@render children()}
  </main>
</div>

<style>
  .app {
    --color-bg: #ffffff;
    --color-text: #1a1a1a;
    --color-primary: #2563eb;
    --color-muted: #6b7280;
    --color-border: #e5e7eb;
    --color-surface: #f9fafb;

    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
      Roboto, Oxygen, Ubuntu, sans-serif;
    color: var(--color-text);
    background: var(--color-bg);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    border-bottom: 1px solid var(--color-border);
  }

  nav {
    max-width: 960px;
    margin: 0 auto;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    width: 100%;
  }

  .brand {
    font-weight: 700;
    font-size: 1.125rem;
    color: var(--color-text);
    text-decoration: none;
  }

  .nav-links {
    display: flex;
    gap: 1.5rem;
    align-items: center;
  }

  .nav-links a {
    color: var(--color-muted);
    text-decoration: none;
    font-size: 0.9375rem;
  }

  .nav-links a:hover {
    color: var(--color-text);
  }

  .nav-user {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-email {
    font-size: 0.875rem;
    color: var(--color-muted);
  }

  .logout-btn {
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
    color: var(--color-muted);
    cursor: pointer;
    font-family: inherit;
  }

  .logout-btn:hover {
    color: var(--color-text);
    border-color: var(--color-muted);
  }

  main {
    flex: 1;
    max-width: 960px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    width: 100%;
  }

  @media (max-width: 640px) {
    nav {
      flex-wrap: wrap;
    }

    .nav-user {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
