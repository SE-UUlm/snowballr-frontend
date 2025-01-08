<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";

    let { data } = $props();
    const { user, projectId, loadingProject } = data;
</script>

<svelte:head>
    {#await loadingProject}
        <title>Loading Project...</title>
    {:then project}
        <title>Papers | {project.name}</title>
    {:catch}
        <title>Papers</title>
    {/await}
</svelte:head>
<ProjectNavigationBar {user} {projectId} {loadingProject} defaultTabValue="papers" />
