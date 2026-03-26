<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';
  import UpgradeBadge from '$lib/components/UpgradeBadge.svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const tierLabel: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    business: 'Business',
  };

  async function openBillingPortal() {
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const body = await res.json();
    if (body.url) {
      window.location.href = body.url;
    }
  }

  async function startCheckout(tier: 'pro' | 'business') {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: tier === 'pro'
          ? data.stripePrices?.pro
          : data.stripePrices?.business,
      }),
    });
    const body = await res.json();
    if (body.url) {
      window.location.href = body.url;
    }
  }
</script>

<svelte:head>
  <title>Settings - hosted-resumes.com</title>
</svelte:head>

<div class="settings">
  <h1>Settings</h1>

  <section class="section">
    <h2>Profile</h2>

    {#if form?.saved}
      <p class="success">Profile updated.</p>
    {/if}
    {#if form?.error}
      <p class="error">{form.error}</p>
    {/if}

    <form method="POST" action="?/profile" use:enhance>
      <div class="field">
        <label for="email">Email</label>
        <input id="email" type="email" value={data.email} disabled />
        <span class="hint">Email cannot be changed.</span>
      </div>

      <div class="field">
        <label for="displayName">Display name</label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          value={data.displayName}
          placeholder="Your name"
        />
      </div>

      <div class="field">
        <label for="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          value={data.username}
          required
        />
        <span class="hint">
          Your resume URL: {data.username}.hosted-resumes.com
        </span>
      </div>

      <button type="submit" class="btn btn-primary">Save changes</button>
    </form>
  </section>

  <section class="section">
    <h2>Subscription</h2>

    <div class="tier-display">
      <span class="tier-badge tier-{data.tier}">
        {tierLabel[data.tier] ?? data.tier}
      </span>
      {#if data.subscriptionStatus && data.subscriptionStatus !== 'active'}
        <span class="sub-status">({data.subscriptionStatus})</span>
      {/if}
    </div>

    {#if data.tier === 'free'}
      <p class="tier-description">
        You are on the Free plan (1 resume). Upgrade to unlock
        unlimited resumes and more themes.
      </p>
    {:else if data.tier === 'pro'}
      <p class="tier-description">
        You are on the Pro plan. Unlimited resumes and all themes.
      </p>
    {:else if data.tier === 'business'}
      <p class="tier-description">
        You are on the Business plan. Everything in Pro plus custom
        domain support and priority PDF generation.
      </p>
    {/if}

    {#if data.stripeCustomerId}
      <button class="btn btn-secondary" onclick={openBillingPortal}>
        Manage billing
      </button>
    {:else if data.tier === 'free'}
      <div class="upgrade-options">
        <button class="btn btn-primary" onclick={() => startCheckout('pro')}>
          Upgrade to Pro
        </button>
        <button class="btn btn-secondary" onclick={() => startCheckout('business')}>
          Upgrade to Business
        </button>
      </div>
    {/if}
  </section>

  <section class="section">
    <h2>Custom domain</h2>

    {#if data.canUseCustomDomain}
      {#if form?.domainSaved}
        <p class="success">Domain settings saved.</p>
      {/if}
      <form method="POST" action="?/customDomain" use:enhance>
        <div class="field">
          <label for="customDomain">Domain</label>
          <input
            id="customDomain"
            name="customDomain"
            type="text"
            placeholder="resume.example.com"
          />
          <span class="hint">
            Point a CNAME record to hosted-resumes.com
          </span>
        </div>
        <button type="submit" class="btn btn-primary">Save domain</button>
      </form>
    {:else}
      <div class="locked-feature">
        <p class="tier-description">
          Custom domains let you serve your resume from your own domain.
        </p>
        <span class="locked-label">
          <UpgradeBadge requiredTier="business" />
          Upgrade to Business to use custom domains.
        </span>
      </div>
    {/if}
  </section>
</div>

<style>
  .settings {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }

  h2 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem;
  }

  .section {
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 1.5rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 1rem;
  }

  label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-muted);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  input {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    font-size: 0.9375rem;
    font-family: inherit;
    color: var(--color-text);
    background: var(--color-bg);
    max-width: 400px;
  }

  input:disabled {
    background: var(--color-surface);
    color: var(--color-muted);
    cursor: not-allowed;
  }

  input:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: -1px;
    border-color: transparent;
  }

  .hint {
    font-size: 0.75rem;
    color: var(--color-muted);
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
    border: none;
  }

  .btn-primary {
    background: var(--color-primary);
    color: #ffffff;
  }

  .btn-primary:hover {
    opacity: 0.9;
  }

  .btn-secondary {
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }

  .btn-secondary:hover {
    border-color: var(--color-muted);
  }

  .success {
    color: #166534;
    background: #dcfce7;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
    margin: 0 0 1rem;
  }

  .error {
    color: #991b1b;
    background: #fef2f2;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
    margin: 0 0 1rem;
  }

  .tier-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .tier-badge {
    display: inline-block;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .tier-free {
    background: var(--color-surface);
    color: var(--color-muted);
  }

  .tier-pro {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .tier-business {
    background: #f3e8ff;
    color: #7c3aed;
  }

  .sub-status {
    font-size: 0.8125rem;
    color: var(--color-muted);
  }

  .tier-description {
    font-size: 0.9375rem;
    color: var(--color-muted);
    margin: 0 0 1rem;
    line-height: 1.5;
  }

  .upgrade-options {
    display: flex;
    gap: 0.75rem;
  }

  .locked-feature {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .locked-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-muted);
  }

  @media (max-width: 640px) {
    .upgrade-options {
      flex-direction: column;
    }
  }
</style>
