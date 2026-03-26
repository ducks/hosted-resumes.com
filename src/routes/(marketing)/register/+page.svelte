<script lang="ts">
  import { goto } from '$app/navigation';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let submitting = $state(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = '';
    submitting = true;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        error = data.error || 'Registration failed';
        return;
      }

      await goto('/dashboard');
    } catch {
      error = 'Something went wrong. Please try again.';
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Sign up - hosted-resumes.com</title>
</svelte:head>

<div class="auth-page">
  <div class="auth-card">
    <h1>Create an account</h1>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <form onsubmit={handleSubmit}>
      <label>
        Email
        <input
          type="email"
          bind:value={email}
          required
          autocomplete="email"
        />
      </label>
      <label>
        Password
        <span class="hint">At least 8 characters</span>
        <input
          type="password"
          bind:value={password}
          required
          minlength="8"
          autocomplete="new-password"
        />
      </label>
      <button type="submit" class="btn btn-primary" disabled={submitting}>
        {submitting ? 'Creating account...' : 'Sign up'}
      </button>
    </form>

    <p class="alt-action">
      Already have an account? <a href="/login">Log in</a>
    </p>
  </div>
</div>

<style>
  .auth-page {
    display: flex;
    justify-content: center;
    padding: 3rem 1rem;
  }

  .auth-card {
    width: 100%;
    max-width: 400px;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 1.5rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
  }

  .hint {
    font-weight: 400;
    color: var(--color-muted);
    font-size: 0.8125rem;
  }

  input {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    font-size: 0.9375rem;
    font-family: inherit;
  }

  input:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: -1px;
    border-color: var(--color-primary);
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.9375rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    border: none;
  }

  .btn-primary {
    background: var(--color-primary);
    color: #ffffff;
  }

  .btn-primary:hover {
    opacity: 0.9;
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error {
    background: #fef2f2;
    color: #dc2626;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
    margin: 0 0 1rem;
  }

  .alt-action {
    margin-top: 1.5rem;
    font-size: 0.875rem;
    color: var(--color-muted);
  }

  .alt-action a {
    color: var(--color-primary);
    text-decoration: none;
  }

  .alt-action a:hover {
    text-decoration: underline;
  }
</style>
