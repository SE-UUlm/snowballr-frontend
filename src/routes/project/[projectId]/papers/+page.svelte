<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";

    let { data } = $props();
    const { user, project } = data;
</script>

<svelte:head>
    <title>Papers | {project.name}</title>
</svelte:head>
<ProjectNavigationBar {user} {project} defaultTabValue="papers" />

<h3>Project {project.id} Papers</h3>
