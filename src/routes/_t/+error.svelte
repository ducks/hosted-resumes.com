<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="tenant-error">
  <h1>{$page.status}</h1>
  {#if $page.status === 404}
    <p>This resume could not be found.</p>
  {:else}
    <p>Something went wrong.</p>
  {/if}
</div>

<style>
  .tenant-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-family: system-ui, -apple-system, sans-serif;
    color: #333;
  }

  h1 {
    font-size: 4rem;
    margin: 0 0 0.5rem;
    font-weight: 300;
  }

  p {
    font-size: 1.125rem;
    color: #666;
    margin: 0;
  }
</style>
