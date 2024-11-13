<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";

    let { children, data } = $props();
    let user = {
        firstName: "Max",
        lastName: "Mustermann",
    };
    let project = {
        id: data.projectId,
        name: `Project ${data.projectId}`,
    };
</script>

<ProjectNavigationBar {user} {project} defaultTabValue="settings" />

<h3>Project {data.projectId} Settings</h3>

{@render children()}
