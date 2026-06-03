<script lang="ts">
    import { ProjectStatus } from "$api/project";
    import ProjectSettingsLayout from "$lib/components/composites/settings/project-settings/ProjectSettingsLayout.svelte";
    import KeywordSettings from "$lib/components/composites/settings/project-settings/review/KeywordSettings.svelte";
    import NumberOfReviewersSettings from "$lib/components/composites/settings/project-settings/review/NumberOfReviewersSettings.svelte";
    import { resource } from "$lib/resource.svelte";
    import { isCurrentUserProjectAdmin } from "../helper";

    let { data } = $props();
    const { projectId, loadingProject, loadingMembers } = $derived(data);

    const isCurrentUserAdmin = $derived(isCurrentUserProjectAdmin(loadingMembers));

    const loadingIsProjectNotActive = $derived(
        loadingProject.then((project) => project.status !== ProjectStatus.ACTIVE),
    );
    const settingsLocked = $derived(
        resource(loadingIsProjectNotActive, {
            initialValue: true,
            onErrorValue: false,
            resourceName: "project status",
        }),
    );
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
        {#if isCurrentUserAdmin.value}
            <NumberOfReviewersSettings
                {loadingProject}
                {projectId}
                settingsLocked={settingsLocked.value}
            />
        {/if}
        <KeywordSettings {projectId} />
    </div>
</ProjectSettingsLayout>
