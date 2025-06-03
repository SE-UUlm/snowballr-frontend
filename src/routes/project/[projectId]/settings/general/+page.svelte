<script lang="ts">
    import ProjectSettingsLayout from "$lib/components/composites/settings/project-settings/ProjectSettingsLayout.svelte";
    import ProjectNameSettings from "$lib/components/composites/settings/project-settings/general/ProjectNameSettings.svelte";
    import { isCurrentUserProjectAdmin } from "../helper.js";

    let { data } = $props();
    const { user, projectId, loadingProject, loadingMembers } = $derived(data);

    const isCurrentUserAdmin = $derived(isCurrentUserProjectAdmin(loadingMembers, user));
</script>

<svelte:head>
    {#await loadingProject}
        <title>Loading Project...</title>
    {:then project}
        <title>General | Settings | {project.name}</title>
    {:catch}
        <title>General | Settings</title>
    {/await}
</svelte:head>

{#if isCurrentUserAdmin.value !== undefined}
    <ProjectSettingsLayout
        isCurrentUserAdmin={isCurrentUserAdmin.value}
        {projectId}
        selectedTab="general"
    >
        <div class="flex flex-col gap-9 overflow-auto p-2.5">
            <ProjectNameSettings {loadingProject} {projectId} />
        </div>
    </ProjectSettingsLayout>
{/if}
