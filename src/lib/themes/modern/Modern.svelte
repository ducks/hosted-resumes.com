<script lang="ts">
  import type { ThemeProps } from "$lib/themes/types";

  let { resume }: ThemeProps = $props();

  const person = $derived(resume.person);
  const experience = $derived(resume.experience ?? []);
  const education = $derived(resume.education ?? []);
  const projects = $derived(resume.projects ?? []);
  const skills = $derived(resume.skills ?? {});

  const contactItems = $derived.by(() => {
    const items: { label: string; value: string }[] = [];
    if (person.email) items.push({ label: "Email", value: person.email });
    if (person.phone) items.push({ label: "Phone", value: person.phone });
    if (person.location) items.push({ label: "Location", value: person.location });
    if (person.website) items.push({ label: "Web", value: person.website });
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

<article class="modern">
  <aside class="sidebar">
    <div class="identity">
      <h1>{person.name}</h1>
      {#if person.headline}
        <p class="headline">{person.headline}</p>
      {/if}
    </div>

    {#if contactItems.length > 0}
      <div class="sidebar-section">
        <h3>Contact</h3>
        <ul class="contact-list">
          {#each contactItems as item}
            <li>
              <span class="contact-label">{item.label}</span>
              <span class="contact-value">{item.value}</span>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if skillCategories.length > 0}
      <div class="sidebar-section">
        <h3>Skills</h3>
        {#each skillCategories as [category, items]}
          <div class="skill-group">
            <h4>{category}</h4>
            <ul class="skill-tags">
              {#each items as skill}
                <li>{skill}</li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    {/if}

    {#if education.length > 0}
      <div class="sidebar-section">
        <h3>Education</h3>
        {#each education as entry}
          <div class="sidebar-entry">
            <strong>{entry.degree}</strong>
            <p class="org">{entry.institution}</p>
            {#if entry.location}
              <p class="meta">{entry.location}</p>
            {/if}
            <p class="meta">{dateRange(entry.start, entry.end)}</p>
          </div>
        {/each}
      </div>
    {/if}
  </aside>

  <main class="content">
    {#if person.summary}
      <section>
        <h2>About</h2>
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
                <span class="at">{entry.company}</span>
              </div>
              <span class="dates">{dateRange(entry.start, entry.end)}</span>
            </div>
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
              <p class="technologies">{entry.technologies.join(" / ")}</p>
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
                  <span class="at">{entry.role}</span>
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
              <p class="technologies">{entry.technologies.join(" / ")}</p>
            {/if}
          </div>
        {/each}
      </section>
    {/if}
  </main>
</article>

<style>
  .modern {
    --accent: #2563eb;
    --accent-light: #dbeafe;
    --text: #1e293b;
    --text-muted: #64748b;
    --sidebar-bg: #f8fafc;
    --border: #e2e8f0;

    font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
    max-width: 8.5in;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 260px 1fr;
    min-height: 11in;
    color: var(--text);
    font-size: 10pt;
    line-height: 1.5;
  }

  .sidebar {
    background: var(--sidebar-bg);
    border-right: 2px solid var(--accent);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .identity h1 {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
    color: var(--accent);
  }

  .identity .headline {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin: 0.25rem 0 0;
  }

  .sidebar-section h3 {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--accent);
    margin: 0 0 0.5rem;
    font-weight: 600;
  }

  .contact-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .contact-label {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
  }

  .contact-value {
    font-size: 0.85rem;
    word-break: break-all;
  }

  .skill-group {
    margin-bottom: 0.5rem;
  }

  .skill-group h4 {
    font-size: 0.8rem;
    font-weight: 600;
    margin: 0 0 0.25rem;
    text-transform: capitalize;
  }

  .skill-tags {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .skill-tags li {
    background: var(--accent-light);
    color: var(--accent);
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 2px;
    font-weight: 500;
  }

  .sidebar-entry {
    margin-bottom: 0.75rem;
  }

  .sidebar-entry strong {
    font-size: 0.85rem;
    display: block;
  }

  .sidebar-entry .org {
    font-size: 0.8rem;
    margin: 0.125rem 0;
  }

  .sidebar-entry .meta {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin: 0;
  }

  .content {
    padding: 1.25rem 1.5rem;
  }

  .content section {
    margin-bottom: 1.25rem;
  }

  h2 {
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--accent);
    border-bottom: 2px solid var(--accent);
    padding-bottom: 0.25rem;
    margin: 0 0 0.75rem;
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

  .at {
    color: var(--text-muted);
    margin-left: 0.25rem;
  }

  .at::before {
    content: "| ";
  }

  .dates {
    font-size: 0.8rem;
    color: var(--text-muted);
    white-space: nowrap;
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
    font-size: 0.8rem;
    color: var(--accent);
    margin: 0.25rem 0 0;
    font-weight: 500;
  }

  .url {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin: 0.125rem 0;
  }

  @media (max-width: 640px) {
    .modern {
      grid-template-columns: 1fr;
    }

    .sidebar {
      border-right: none;
      border-bottom: 2px solid var(--accent);
    }
  }

  @media print {
    .modern {
      max-width: none;
      min-height: auto;
    }
  }
</style>
