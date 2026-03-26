<script lang="ts">
  import LivePreview from './LivePreview.svelte';
  import type { JoblResume } from '$lib/jobl/schema';

  let {
    data,
    theme = 'classic',
  }: {
    data: JoblResume | Record<string, unknown>;
    theme?: string;
  } = $props();

  let debouncedData = $state<JoblResume | Record<string, unknown>>(
    structuredClone(data)
  );
  let timer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    const snapshot = data;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      debouncedData = snapshot;
      timer = null;
    }, 150);

    return () => {
      if (timer) clearTimeout(timer);
    };
  });
</script>

<LivePreview data={debouncedData} {theme} />
