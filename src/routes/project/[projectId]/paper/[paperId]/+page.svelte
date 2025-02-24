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
        reviewers,
        criteriaWithReviews,
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
    allowEditModeToggle
    backRef={`/project/${projectId}/dashboard`}
    {backwardReferencedPapers}
    {criteriaWithReviews}
    {forwardReferencedPapers}
    loadingPaper={loadingProjectPaper}
    {loadingProject}
    {reviewers}
    showButtonBar
    {user}
    userConfig={{ isReviewMode }}
/>
