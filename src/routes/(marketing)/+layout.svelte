<script lang="ts">
  import type { LayoutData } from './$types';

  export let data: LayoutData;
</script>

<div class="marketing">
  <header>
    <nav>
      <a href="/" class="brand">hosted-resumes.com</a>
      <div class="nav-links">
        <a href="/pricing">Pricing</a>
        {#if data.user}
          <a href="/dashboard">Dashboard</a>
        {:else}
          <a href="/login">Log in</a>
        {/if}
      </div>
    </nav>
  </header>

  <main>
    <slot />
  </main>

  <footer>
    <div class="footer-inner">
      <p>&copy; {new Date().getFullYear()} hosted-resumes.com</p>
      <div class="footer-links">
        <a href="https://github.com/rektdeckard/jobl">JOBL spec</a>
        <a href="/register" class="footer-cta">Sign up</a>
      </div>
    </div>
  </footer>
</div>

<style>
  .marketing {
    --color-bg: #ffffff;
    --color-text: #1a1a1a;
    --color-primary: #2563eb;
    --color-muted: #6b7280;
    --color-border: #e5e7eb;

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
    justify-content: space-between;
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

  main {
    flex: 1;
    max-width: 960px;
    margin: 0 auto;
    padding: 0 1.5rem;
    width: 100%;
  }

  footer {
    border-top: 1px solid var(--color-border);
    margin-top: 4rem;
  }

  .footer-inner {
    max-width: 960px;
    margin: 0 auto;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.875rem;
    color: var(--color-muted);
  }

  .footer-links {
    display: flex;
    gap: 1.5rem;
    align-items: center;
  }

  .footer-links a {
    color: var(--color-muted);
    text-decoration: none;
  }

  .footer-links a:hover {
    color: var(--color-text);
  }

  .footer-cta {
    color: var(--color-primary) !important;
    font-weight: 600;
  }

  footer p {
    margin: 0;
  }

  @media (max-width: 640px) {
    nav {
      flex-direction: column;
      gap: 0.75rem;
    }

    .footer-inner {
      flex-direction: column;
      gap: 0.75rem;
      text-align: center;
    }
  }
</style>
