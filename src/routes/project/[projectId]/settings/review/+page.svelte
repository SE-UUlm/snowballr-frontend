<script lang="ts">
    import ProjectSettingsLayout from "$lib/components/composites/settings/project-settings/ProjectSettingsLayout.svelte";
    import KeywordSettings from "$lib/components/composites/settings/project-settings/review/KeywordSettings.svelte";
    import { UserContextKey, type UserContext } from "$lib/current-user/userContext.js";
    import { getContext } from "svelte";
    import { isCurrentUserProjectAdmin } from "../helper.js";

    let { data } = $props();
    const { projectId, loadingProject, loadingMembers } = $derived(data);

    const user = $derived(getContext<UserContext>(UserContextKey)());

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
