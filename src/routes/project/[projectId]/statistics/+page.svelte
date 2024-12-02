<script lang="ts">
    import ProjectNavigationBar from "$lib/components/composites/navigation-bar/ProjectNavigationBar.svelte";

    const { data } = $props();
    const { user, project } = data;
</script>

<ProjectNavigationBar {user} {project} defaultTabValue="statistics" />

<h3>Project {data.project.id} Statistics</h3>
