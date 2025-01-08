<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";

    const { children, data } = $props();
    const { user, projectId, loadingProject } = data;
</script>

<ProjectNavigationBar {user} {projectId} {loadingProject} defaultTabValue="settings" />

{@render children()}
