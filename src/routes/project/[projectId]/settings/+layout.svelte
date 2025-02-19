<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";

    const { children, data } = $props();
    const { user, projectId, loadingProject } = data;
</script>

<ProjectNavigationBar defaultTabValue="settings" {loadingProject} {projectId} {user} />

{@render children()}
