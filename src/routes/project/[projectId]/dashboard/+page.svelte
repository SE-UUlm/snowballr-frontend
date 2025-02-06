<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";

    const { data } = $props();
    const { user, projectId, loadingProject } = data;
</script>

<svelte:head>
    {#await loadingProject}
        <title>Loading Project...</title>
    {:then project}
        <title>{project.name}</title>
    {:catch}
        <title>Project Dashboard</title>
    {/await}
</svelte:head>
<ProjectNavigationBar defaultTabValue="dashboard" {loadingProject} {projectId} {user} />

{#await loadingProject}
    <h3>Project loading</h3>
    {:then project}
    <h3>Project {project.name} Dashboard</h3>
{/await}
