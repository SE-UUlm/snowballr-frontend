<script lang="ts">
    import ProjectSettingsLayout from "$lib/components/composites/settings/project-settings/ProjectSettingsLayout.svelte";
    import ReviewModeSettings from "$lib/components/composites/settings/project-settings/ReviewModeSettings.svelte";

    let { data } = $props();
    const { projectId, loadingProject } = data;
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

<ProjectSettingsLayout {projectId} selectedTab="review">
    <div class="flex flex-col gap-9 overflow-auto p-2.5">
        <ReviewModeSettings />
    </div>
</ProjectSettingsLayout>
