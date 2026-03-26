<script lang="ts">
  let { requiredTier }: { requiredTier: string } = $props();

  const labels: Record<string, string> = {
    pro: 'Pro',
    business: 'Business',
  };
</script>

<span class="upgrade-badge tier-{requiredTier}">
  {labels[requiredTier] ?? requiredTier}
</span>

<style>
  .upgrade-badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    vertical-align: middle;
    user-select: none;
  }

  .tier-pro {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .tier-business {
    background: #f3e8ff;
    color: #7c3aed;
  }
</style>
