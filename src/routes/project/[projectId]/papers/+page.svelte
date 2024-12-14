<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";
    import { getCurrentUser } from "$lib/current-user.js";

    let { data } = $props();
    const { project } = data;
    const user = getCurrentUser();
</script>

<svelte:head>
    <title>Papers | {project.name}</title>
</svelte:head>
<ProjectNavigationBar {user} {project} defaultTabValue="papers" />

<h3>Project {project.id} Papers</h3>
