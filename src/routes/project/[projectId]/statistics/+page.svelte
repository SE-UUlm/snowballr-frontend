<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";

    const { data } = $props();
    const { user, project } = data;
</script>

<svelte:head>
    <title>Statistics | {project.name}</title>
</svelte:head>
<ProjectNavigationBar {user} {project} defaultTabValue="statistics" />

<h3>Project {project.id} Statistics</h3>
