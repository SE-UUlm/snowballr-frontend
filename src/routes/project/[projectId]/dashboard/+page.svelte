<script lang="ts">
    import ProjectNavigationBar from "$lib/components/custom/ProjectNavigationBar.svelte";

    const { data } = $props();

    const user = {
        firstName: "Max",
        lastName: "Mustermann",
    };
    const project = {
        id: data.projectId,
        name: `Project ${data.projectId}`,
    };
</script>

<ProjectNavigationBar {user} {project} defaultTabValue="dashboard" />

<h3>Project {data.projectId} Dashboard</h3>
