<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";

    const { children, data } = $props();
    const { projectId, loadingProject } = $derived(data);
</script>

<ProjectNavigationBar defaultTabValue="settings" {loadingProject} {projectId} />

{@render children()}
