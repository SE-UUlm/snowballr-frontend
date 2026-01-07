<script lang="ts">
    import ProjectSettingsLayout from "$lib/components/composites/settings/project-settings/ProjectSettingsLayout.svelte";
    import KeywordSettings from "$lib/components/composites/settings/project-settings/review/KeywordSettings.svelte";
    import { isCurrentUserProjectAdmin } from "../helper";

    let { data } = $props();
    const { projectId, loadingProject, loadingMembers } = $derived(data);

    const isCurrentUserAdmin = $derived(isCurrentUserProjectAdmin(loadingMembers));
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

<ProjectSettingsLayout
    isCurrentUserAdmin={isCurrentUserAdmin.value ?? false}
    {projectId}
    selectedTab="review"
>
    <div class="flex flex-col gap-9 p-2.5">
        <KeywordSettings {projectId} />
    </div>
</ProjectSettingsLayout>
