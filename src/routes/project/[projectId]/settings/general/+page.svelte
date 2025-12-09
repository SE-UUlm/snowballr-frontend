<script lang="ts">
    import ProjectSettingsLayout from "$lib/components/composites/settings/project-settings/ProjectSettingsLayout.svelte";
    import ProjectNameSettings from "$lib/components/composites/settings/project-settings/general/ProjectNameSettings.svelte";
    import { getContext } from "svelte";
    import { isCurrentUserProjectAdmin } from "../helper.js";
    import { UserContextKey, type UserContext } from "$lib/current-user/userContext.js";
    import ExportProjectSettings from "$lib/components/composites/settings/project-settings/general/ExportProjectSettings.svelte";

    let { data } = $props();
    const { projectId, loadingProject, loadingMembers } = $derived(data);

    const user = $derived(getContext<UserContext>(UserContextKey)());

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
            <ExportProjectSettings {projectId} />
        </div>
    </ProjectSettingsLayout>
{/if}
