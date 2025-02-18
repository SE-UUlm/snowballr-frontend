<script lang="ts">
    import PaperView from "$lib/components/composites/paper-components/paper-view/PaperView.svelte";

    const { data } = $props();
    const {
        user,
        projectId,
        loadingProject,
        loadingProjectPaper,
        backwardReferencedPapers,
        forwardReferencedPapers,
        isReviewMode,
    } = data;
</script>

<svelte:head>
    {#await Promise.all([loadingProject, loadingProjectPaper])}
        <title>Loading paper and project...</title>
    {:then [project, { paper }]}
        <title>{paper!.title} | {project.name}</title>
    {:catch}
        <title>Failed loading data</title>
    {/await}
</svelte:head>

<PaperView
    {user}
    loadingPaper={loadingProjectPaper}
    {backwardReferencedPapers}
    {forwardReferencedPapers}
    showButtonBar
    backRef={`/project/${projectId}/dashboard`}
    userConfig={{ isReviewMode, showMaybeButton: true }}
    allowEditModeToggle
/>
