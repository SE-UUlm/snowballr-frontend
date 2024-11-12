<script lang="ts">
    import ProjectNavigationBar from "$lib/components/custom/ProjectNavigationBar.svelte";

    let { data } = $props();
    let user = {
        firstName: "Max",
        lastName: "Mustermann",
    };
    let project = {
        id: data.projectId,
        name: `Project ${data.projectId}`,
    };
</script>

<ProjectNavigationBar {user} {project} defaultTabValue="statistics" />

<h3>Project {data.projectId} Statistics</h3>
