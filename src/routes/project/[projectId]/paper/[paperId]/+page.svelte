<script lang="ts">
    import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";

    const { data } = $props();
    const { user, project, paper } = data;
</script>

<svelte:head>
    <title>{paper.title} | {project.name}</title>
</svelte:head>
<PaperNavigationBar {user} backRef={`/project/${project.id}/dashboard`} {paper} />
