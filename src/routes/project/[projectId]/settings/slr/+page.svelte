<script lang="ts">
    import ProjectSettingsLayout from "$lib/components/composites/settings/ProjectSettingsLayout.svelte";

    let { data } = $props();
    const { projectId, loadingProject } = data;
</script>

<svelte:head>
    {#await loadingProject}
        <title>Loading Project...</title>
    {:then project}
        <title>SLR | Settings | {project.name}</title>
    {:catch}
        <title>SLR | Settings</title>
    {/await}
</svelte:head>

<ProjectSettingsLayout {projectId} selectedTab="slr">SLR content</ProjectSettingsLayout>
