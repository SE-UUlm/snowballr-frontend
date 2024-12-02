<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";

    const { children, data } = $props();
    const { user, project } = data;
</script>

<ProjectNavigationBar {user} {project} defaultTabValue="settings" />

<h3>Project {project.id} Settings</h3>

{@render children()}
