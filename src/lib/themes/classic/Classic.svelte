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
    if (d === "present") return "Present";
    const [year, month] = d.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  }

  function dateRange(start?: string, end?: string): string {
    if (!start && !end) return "";
    if (start && !end) return formatDate(start);
    if (!start && end) return formatDate(end);
    return `${formatDate(start)} - ${formatDate(end)}`;
  }
</script>

<article class="classic">
  <header>
    <h1>{person.name}</h1>
    {#if person.headline}
      <p class="headline">{person.headline}</p>
    {/if}
    {#if contactItems.length > 0}
      <p class="contact">{contactItems.join(" | ")}</p>
    {/if}
  </header>

  {#if person.summary}
    <section class="summary">
      <h2>Summary</h2>
      <p>{person.summary}</p>
    </section>
  {/if}

  {#if experience.length > 0}
    <section>
      <h2>Experience</h2>
      {#each experience as entry}
        <div class="entry">
          <div class="entry-header">
            <div>
              <strong>{entry.title}</strong>
              <span class="separator"> at </span>
              <span class="org">{entry.company}</span>
            </div>
            <span class="dates">{dateRange(entry.start, entry.end)}</span>
          </div>
          {#if entry.location}
            <p class="location">{entry.location}</p>
          {/if}
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
            <p class="technologies">{entry.technologies.join(", ")}</p>
          {/if}
        </div>
      {/each}
    </section>
  {/if}

  {#if education.length > 0}
    <section>
      <h2>Education</h2>
      {#each education as entry}
        <div class="entry">
          <div class="entry-header">
            <div>
              <strong>{entry.degree}</strong>
              <span class="separator"> - </span>
              <span class="org">{entry.institution}</span>
            </div>
            <span class="dates">{dateRange(entry.start, entry.end)}</span>
          </div>
          {#if entry.location}
            <p class="location">{entry.location}</p>
          {/if}
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
      <h2>Projects</h2>
      {#each projects as entry}
        <div class="entry">
          <div class="entry-header">
            <div>
              <strong>{entry.name}</strong>
              {#if entry.role}
                <span class="separator"> - </span>
                <span class="org">{entry.role}</span>
              {/if}
            </div>
            <span class="dates">{dateRange(entry.start, entry.end)}</span>
          </div>
          {#if entry.url}
            <p class="url">{entry.url}</p>
          {/if}
          {#if entry.summary}
            <p class="entry-summary">{entry.summary}</p>
          {/if}
          {#if entry.technologies && entry.technologies.length > 0}
            <p class="technologies">{entry.technologies.join(", ")}</p>
          {/if}
        </div>
      {/each}
    </section>
  {/if}

  {#if skillCategories.length > 0}
    <section>
      <h2>Skills</h2>
      <div class="skills-grid">
        {#each skillCategories as [category, items]}
          <div class="skill-category">
            <strong>{category}:</strong>
            <span>{items.join(", ")}</span>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</article>

<style>
  .classic {
    font-family: Georgia, "Times New Roman", serif;
    max-width: 8.5in;
    margin: 0 auto;
    padding: 0.5in;
    color: #1a1a1a;
    line-height: 1.5;
    font-size: 10.5pt;
  }

  header {
    text-align: center;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 1rem;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .headline {
    font-size: 1rem;
    color: #444;
    margin: 0.25rem 0;
    font-style: italic;
  }

  .contact {
    font-size: 0.85rem;
    color: #555;
    margin: 0.5rem 0 0;
  }

  h2 {
    font-size: 1.1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #ccc;
    padding-bottom: 0.25rem;
    margin: 1.25rem 0 0.75rem;
  }

  .summary p {
    margin: 0;
  }

  .entry {
    margin-bottom: 0.75rem;
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .separator {
    color: #666;
  }

  .org {
    font-style: italic;
  }

  .dates {
    font-size: 0.85rem;
    color: #555;
    white-space: nowrap;
  }

  .location {
    font-size: 0.85rem;
    color: #666;
    margin: 0.125rem 0;
  }

  .entry-summary {
    margin: 0.25rem 0;
  }

  ul {
    margin: 0.25rem 0;
    padding-left: 1.25rem;
  }

  li {
    margin-bottom: 0.125rem;
  }

  .technologies {
    font-size: 0.85rem;
    color: #666;
    font-style: italic;
    margin: 0.25rem 0 0;
  }

  .url {
    font-size: 0.85rem;
    color: #666;
    margin: 0.125rem 0;
  }

  .skills-grid {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .skill-category strong {
    text-transform: capitalize;
  }

  @media print {
    .classic {
      padding: 0;
      max-width: none;
    }
  }
</style>
