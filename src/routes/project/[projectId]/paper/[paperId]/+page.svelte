<script lang="ts">
    import PaperView from "$lib/components/composites/paper-components/paper-view/PaperView.svelte";

    const { data } = $props();
    const { user, projectId, loadingProject, loadingPaper, isReviewMode } = data;
</script>

<svelte:head>
    {#await Promise.all([loadingProject, loadingPaper])}
        <title>Loading Paper and Project...</title>
    {:then [project, paper]}
        <title>{paper.title} | {project.name}</title>
    {:catch}
        <title>Failed loading data</title>
    {/await}
</svelte:head>
<PaperView
    {user}
    {loadingPaper}
    showButtonBar
    backRef={`/project/${projectId}/dashboard`}
    userConfig={{ isReviewMode, showMaybeButton: true }}
    allowEditModeToggle
/>
