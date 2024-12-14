<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";
    import { getCurrentUser } from "$lib/current-user.js";

    const { data } = $props();
    const { project } = data;
    const user = getCurrentUser();
</script>

<svelte:head>
    <title>{project.name}</title>
</svelte:head>
<ProjectNavigationBar {user} {project} defaultTabValue="dashboard" />

<h3>Project {project.id} Dashboard</h3>
