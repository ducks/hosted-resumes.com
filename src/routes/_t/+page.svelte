<script lang="ts">
  import type { JoblResume } from '$lib/jobl/schema';
  import { getTheme, getDefaultTheme } from '$lib/themes';

  const { data } = $props();

  const resume = data.resume.data as JoblResume;
  const entry = getTheme(data.resume.theme) ?? getDefaultTheme();
  const ThemeComponent = entry.component;
</script>

<svelte:head>
  <title>{resume.person?.name ?? 'Resume'}</title>
  {#if resume.person?.headline}
    <meta name="description" content={resume.person.headline} />
  {/if}
  <meta name="robots" content="index, follow" />
</svelte:head>

<ThemeComponent {resume} />
