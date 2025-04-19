<script lang="ts">
    import ProjectSettingsLayout from "$lib/components/composites/settings/project-settings/ProjectSettingsLayout.svelte";
    import KeywordSettings from "$lib/components/composites/settings/project-settings/review/KeywordSettings.svelte";

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
        <KeywordSettings maximalTagLength={15} maximumAmountOfTags={25} {projectId}/>
    </div>
</ProjectSettingsLayout>
