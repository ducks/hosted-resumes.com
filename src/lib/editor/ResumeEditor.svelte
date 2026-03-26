<script lang="ts">
  import SectionEditor from './SectionEditor.svelte';
  import ArraySectionEditor from './ArraySectionEditor.svelte';
  import {
    personFields,
    experienceFields,
    projectFields,
    educationFields,
    emptyExperience,
    emptyProject,
    emptyEducation,
  } from './fields';
  import type { Autosave } from '$lib/stores/autosave';

  let {
    joblContent = $bindable({}),
    autosave,
  }: {
    joblContent: Record<string, unknown>;
    autosave: Autosave;
  } = $props();

  // Ensure sub-objects exist
  if (!joblContent.person || typeof joblContent.person !== 'object') {
    joblContent.person = { name: '' };
  }
  if (!joblContent.jobl_version) {
    joblContent.jobl_version = '0.1.0';
  }

  let person = $state(joblContent.person as Record<string, unknown>);
  let experience = $state(
    (Array.isArray(joblContent.experience) ? joblContent.experience : []) as Record<string, unknown>[]
  );
  let projects = $state(
    (Array.isArray(joblContent.projects) ? joblContent.projects : []) as Record<string, unknown>[]
  );
  let education = $state(
    (Array.isArray(joblContent.education) ? joblContent.education : []) as Record<string, unknown>[]
  );

  // Skills are edited as a special section later; for now pass through
  function emitChange() {
    joblContent = {
      ...joblContent,
      person,
      experience: experience.length > 0 ? experience : undefined,
      projects: projects.length > 0 ? projects : undefined,
      education: education.length > 0 ? education : undefined,
    };
    autosave.save(joblContent);
  }
</script>

<div class="resume-editor">
  <SectionEditor
    title="Personal info"
    fields={personFields}
    bind:data={person}
    onchange={emitChange}
  />

  <ArraySectionEditor
    title="Experience"
    fields={experienceFields}
    bind:items={experience}
    emptyItem={emptyExperience}
    onchange={emitChange}
  />

  <ArraySectionEditor
    title="Projects"
    fields={projectFields}
    bind:items={projects}
    emptyItem={emptyProject}
    onchange={emitChange}
  />

  <ArraySectionEditor
    title="Education"
    fields={educationFields}
    bind:items={education}
    emptyItem={emptyEducation}
    onchange={emitChange}
  />
</div>

<style>
  .resume-editor {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
</style>
