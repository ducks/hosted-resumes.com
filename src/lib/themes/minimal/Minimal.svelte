<script lang="ts">
  import type { ThemeProps } from "$lib/themes/types";

  let { resume }: ThemeProps = $props();

  const person = $derived(resume.person);
  const experience = $derived(resume.experience ?? []);
  const education = $derived(resume.education ?? []);
  const projects = $derived(resume.projects ?? []);
  const skills = $derived(resume.skills ?? {});

  const contactItems = $derived.by(() => {
    const items: string[] = [];
    if (person.email) items.push(person.email);
    if (person.phone) items.push(person.phone);
    if (person.location) items.push(person.location);
    if (person.website) items.push(person.website);
    return items;
  });

  const skillCategories = $derived(Object.entries(skills));

  function formatDate(d?: string): string {
    if (!d) return "";
    if (d === "present") return "present";
    const [year, month] = d.split("-");
    return `${year}.${month}`;
  }

  function dateRange(start?: string, end?: string): string {
    if (!start && !end) return "";
    if (start && !end) return formatDate(start);
    if (!start && end) return formatDate(end);
    return `${formatDate(start)} -- ${formatDate(end)}`;
  }
</script>

<article class="minimal">
  <header>
    <h1>{person.name}</h1>
    {#if person.headline}
      <p class="headline">{person.headline}</p>
    {/if}
    {#if contactItems.length > 0}
      <p class="contact">
        {#each contactItems as item, i}
          {#if i > 0}<span class="dot">&middot;</span>{/if}
          <span>{item}</span>
        {/each}
      </p>
    {/if}
  </header>

  {#if person.summary}
    <section>
      <h2>summary</h2>
      <p>{person.summary}</p>
    </section>
  {/if}

  {#if experience.length > 0}
    <section>
      <h2>experience</h2>
      {#each experience as entry}
        <div class="entry">
          <div class="entry-line">
            <span class="title">{entry.title}</span>
            <span class="fill"></span>
            <span class="dates">{dateRange(entry.start, entry.end)}</span>
          </div>
          <p class="org">{entry.company}{#if entry.location}, {entry.location}{/if}</p>
          {#if entry.summary}
            <p class="entry-summary">{entry.summary}</p>
          {/if}
          {#if entry.highlights && entry.highlights.length > 0}
            <ul>
              {#each entry.highlights as highlight}
                <li>{highlight}</li>
              {/each}
            </ul>
          {/if}
          {#if entry.technologies && entry.technologies.length > 0}
            <p class="tech">{entry.technologies.join(", ")}</p>
          {/if}
        </div>
      {/each}
    </section>
  {/if}

  {#if education.length > 0}
    <section>
      <h2>education</h2>
      {#each education as entry}
        <div class="entry">
          <div class="entry-line">
            <span class="title">{entry.degree}</span>
            <span class="fill"></span>
            <span class="dates">{dateRange(entry.start, entry.end)}</span>
          </div>
          <p class="org">{entry.institution}{#if entry.location}, {entry.location}{/if}</p>
          {#if entry.details && entry.details.length > 0}
            <ul>
              {#each entry.details as detail}
                <li>{detail}</li>
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
    </section>
  {/if}

  {#if projects.length > 0}
    <section>
      <h2>projects</h2>
      {#each projects as entry}
        <div class="entry">
          <div class="entry-line">
            <span class="title">{entry.name}</span>
            {#if entry.role}
              <span class="role">({entry.role})</span>
            {/if}
            <span class="fill"></span>
            <span class="dates">{dateRange(entry.start, entry.end)}</span>
          </div>
          {#if entry.url}
            <p class="url">{entry.url}</p>
          {/if}
          {#if entry.summary}
            <p class="entry-summary">{entry.summary}</p>
          {/if}
          {#if entry.technologies && entry.technologies.length > 0}
            <p class="tech">{entry.technologies.join(", ")}</p>
          {/if}
        </div>
      {/each}
    </section>
  {/if}

  {#if skillCategories.length > 0}
    <section>
      <h2>skills</h2>
      {#each skillCategories as [category, items]}
        <p class="skill-line">
          <span class="skill-label">{category}</span>
          <span>{items.join(", ")}</span>
        </p>
      {/each}
    </section>
  {/if}
</article>

<style>
  .minimal {
    font-family: "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif;
    max-width: 38rem;
    margin: 0 auto;
    padding: 1in 0.75in;
    color: #111;
    line-height: 1.6;
    font-size: 10pt;
  }

  header {
    margin-bottom: 2rem;
  }

  h1 {
    font-family: "IBM Plex Mono", "Courier New", monospace;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .headline {
    font-size: 0.95rem;
    color: #555;
    margin: 0.25rem 0 0;
  }

  .contact {
    font-size: 0.8rem;
    color: #666;
    margin: 0.5rem 0 0;
  }

  .dot {
    margin: 0 0.5rem;
    color: #ccc;
  }

  h2 {
    font-family: "IBM Plex Mono", "Courier New", monospace;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: lowercase;
    letter-spacing: 0.08em;
    color: #888;
    margin: 1.75rem 0 0.75rem;
    padding: 0;
  }

  section p {
    margin: 0 0 0.25rem;
  }

  .entry {
    margin-bottom: 1rem;
  }

  .entry-line {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .title {
    font-weight: 600;
  }

  .fill {
    flex: 1;
    border-bottom: 1px dotted #ddd;
    min-width: 1rem;
    margin-bottom: 0.25em;
  }

  .dates {
    font-family: "IBM Plex Mono", "Courier New", monospace;
    font-size: 0.8rem;
    color: #888;
    white-space: nowrap;
  }

  .role {
    font-size: 0.85rem;
    color: #888;
  }

  .org {
    font-size: 0.85rem;
    color: #666;
    margin: 0.125rem 0;
  }

  .entry-summary {
    margin: 0.375rem 0;
  }

  ul {
    margin: 0.25rem 0;
    padding-left: 1rem;
    list-style: none;
  }

  li::before {
    content: "-";
    color: #ccc;
    margin-right: 0.5rem;
  }

  li {
    margin-bottom: 0.125rem;
  }

  .tech {
    font-family: "IBM Plex Mono", "Courier New", monospace;
    font-size: 0.75rem;
    color: #888;
    margin: 0.25rem 0 0;
  }

  .url {
    font-size: 0.8rem;
    color: #888;
    margin: 0.125rem 0;
  }

  .skill-line {
    margin: 0.25rem 0;
  }

  .skill-label {
    font-family: "IBM Plex Mono", "Courier New", monospace;
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: lowercase;
    margin-right: 0.75rem;
  }

  .skill-label::after {
    content: ":";
  }

  @media print {
    .minimal {
      padding: 0;
      max-width: none;
    }
  }
</style>
