<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";
    import { getCurrentUser } from "$lib/current-user.js";

    const { data } = $props();
    const { user, projectId, loadingProject } = data;
    const user = getCurrentUser();
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
<ProjectNavigationBar defaultTabValue="statistics" {loadingProject} {projectId} {user} />
