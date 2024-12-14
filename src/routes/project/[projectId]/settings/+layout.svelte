<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";
    import { getCurrentUser } from "$lib/current-user.js";

    const { children, data } = $props();
    const { project } = data;
    const user = getCurrentUser();
</script>

<ProjectNavigationBar {user} {project} defaultTabValue="settings" />

<h3>Project {project.id} Settings</h3>

{@render children()}
