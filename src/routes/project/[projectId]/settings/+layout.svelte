<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";
    import { getCurrentUser } from "$lib/current-user.js";

    const { children, data } = $props();
    const { user, projectId, loadingProject } = data;
    const user = getCurrentUser();
</script>

<ProjectNavigationBar defaultTabValue="settings" {loadingProject} {projectId} {user} />

{@render children()}
