<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";

    const { data } = $props();
    const { user, projectId, loadingProject } = data;
</script>

<svelte:head>
    {#await loadingProject}
        <title>Loading Project...</title>
    {:then project}
        <title>Statistics | {project.name}</title>
    {:catch}
        <title>Statistics</title>
    {/await}
</svelte:head>
<ProjectNavigationBar {user} {projectId} {loadingProject} defaultTabValue="statistics" />
