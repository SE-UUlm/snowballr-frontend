<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";

    const { data } = $props();
    const { user, project } = data;
</script>

<svelte:head>
    <title>{project.name}</title>
</svelte:head>
<ProjectNavigationBar {user} {project} defaultTabValue="dashboard" />

<h3>Project {project.id} Dashboard</h3>
