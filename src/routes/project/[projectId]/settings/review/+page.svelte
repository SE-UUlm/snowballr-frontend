<script lang="ts">
    import ProjectSettingsLayout from "$lib/components/composites/settings/project-settings/ProjectSettingsLayout.svelte";
    import KeywordSettings from "$lib/components/composites/settings/project-settings/review/KeywordSettings.svelte";
    import { isCurrentUserProjectAdmin } from "../helper.js";

    let { data } = $props();
    const { user, projectId, loadingProject, loadingMembers } = $derived(data);

    const isCurrentUserAdmin = $derived(isCurrentUserProjectAdmin(loadingMembers, user));
</script>

<svelte:head>
    {#await loadingProject}
        <title>Loading Project...</title>
    {:then project}
        <title>Review | Settings | {project.name}</title>
    {:catch}
        <title>Review | Settings</title>
    {/await}
</svelte:head>

{#if isCurrentUserAdmin.value !== undefined}
    <ProjectSettingsLayout
        isCurrentUserAdmin={isCurrentUserAdmin.value}
        {projectId}
        selectedTab="review"
    >
        <div class="flex flex-col gap-9 overflow-auto p-2.5">
            <KeywordSettings {projectId} />
        </div>
    </ProjectSettingsLayout>
{/if}
