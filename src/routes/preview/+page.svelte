<script lang="ts">
  import type { JoblResume } from "$lib/jobl/schema";
  import {
    getAllThemes,
    getTheme,
    type ThemeEntry,
  } from "$lib/themes";

  const fullResume: JoblResume = {
    jobl_version: "0.1.0",
    person: {
      name: "Ada Lovelace",
      headline: "Software Engineer & Mathematician",
      location: "London, UK",
      email: "ada@example.com",
      website: "https://ada.dev",
      phone: "+44 20 7946 0958",
      summary:
        "Experienced engineer with a focus on analytical engines, " +
        "algorithm design, and translating complex mathematical " +
        "concepts into practical computation.",
    },
    skills: {
      languages: ["Python", "Rust", "TypeScript", "SQL"],
      infrastructure: ["Docker", "Kubernetes", "Terraform", "AWS"],
      tools: ["Git", "PostgreSQL", "Redis", "Linux"],
    },
    experience: [
      {
        title: "Senior Software Engineer",
        company: "Babbage Computing",
        location: "London, UK",
        start: "2020-03",
        end: "present",
        summary: "Lead engineer on the analytical engine platform.",
        technologies: ["Rust", "PostgreSQL", "gRPC"],
        highlights: [
          "Designed and shipped the difference engine v2 compiler",
          "Reduced computation latency by 40% through pipeline optimization",
          "Mentored a team of 4 junior engineers",
        ],
      },
      {
        title: "Software Engineer",
        company: "Royal Society Labs",
        location: "Cambridge, UK",
        start: "2017-06",
        end: "2020-02",
        summary: "Built internal tooling for scientific computation.",
        technologies: ["Python", "NumPy", "Flask"],
        highlights: [
          "Automated the data processing pipeline, saving 20 hours per week",
          "Contributed to open-source numerical analysis libraries",
        ],
      },
    ],
    education: [
      {
        institution: "University of London",
        degree: "MSc Computer Science",
        location: "London, UK",
        start: "2015-09",
        end: "2017-06",
        details: [
          "Thesis: Formal verification of mechanical computation",
          "First Class Honours",
        ],
      },
    ],
    projects: [
      {
        name: "note-engine",
        url: "https://github.com/ada/note-engine",
        summary:
          "A structured note-taking system with bidirectional links " +
          "and full-text search.",
        role: "Creator",
        start: "2022-01",
        technologies: ["Rust", "SQLite", "TUI"],
      },
    ],
  };

  const partialResume: JoblResume = {
    jobl_version: "0.1.0",
    person: {
      name: "Jane Doe",
    },
    experience: [
      {
        title: "Engineer",
        company: "Acme Corp",
        start: "2023-01",
        end: "present",
      },
    ],
  };

  const allThemes = getAllThemes();
  let activeThemeId = $state("classic");
  let activeDataset = $state<"full" | "partial">("full");

  const activeTheme = $derived(
    getTheme(activeThemeId) as ThemeEntry
  );
  const activeResume = $derived(
    activeDataset === "full" ? fullResume : partialResume
  );
</script>

<div class="preview-controls">
  <div class="control-group">
    <span class="label">Theme:</span>
    {#each allThemes as theme}
      <button
        class:active={activeThemeId === theme.meta.id}
        onclick={() => (activeThemeId = theme.meta.id)}
      >
        {theme.meta.name}
        <span class="tier">({theme.meta.tier})</span>
      </button>
    {/each}
  </div>
  <div class="control-group">
    <span class="label">Data:</span>
    <button
      class:active={activeDataset === "full"}
      onclick={() => (activeDataset = "full")}
    >
      Full
    </button>
    <button
      class:active={activeDataset === "partial"}
      onclick={() => (activeDataset = "partial")}
    >
      Partial
    </button>
  </div>
</div>

<div class="preview-frame">
  <activeTheme.component resume={activeResume} />
</div>

<style>
  .preview-controls {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #1e293b;
    color: #e2e8f0;
    padding: 0.75rem 1rem;
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    align-items: center;
    font-family: system-ui, sans-serif;
    font-size: 0.85rem;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .label {
    font-weight: 600;
    color: #94a3b8;
  }

  button {
    background: #334155;
    color: #e2e8f0;
    border: 1px solid #475569;
    padding: 0.375rem 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
  }

  button:hover {
    background: #475569;
  }

  button.active {
    background: #2563eb;
    border-color: #3b82f6;
  }

  .tier {
    font-size: 0.7rem;
    color: #94a3b8;
  }

  .preview-frame {
    background: white;
    min-height: 100vh;
  }
</style>
