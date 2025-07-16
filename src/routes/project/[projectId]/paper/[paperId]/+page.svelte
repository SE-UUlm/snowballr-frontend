<script lang="ts">
    import ProjectPaperView from "$lib/components/composites/paper-components/paper-view/ProjectPaperView.svelte";

    const { data } = $props();
    const {
        projectId,
        loadingProject,
        loadingProjectPaper,
        backwardReferencedPapers,
        forwardReferencedPapers,
        reviewers,
        criteriaWithReviews,
    } = $derived(data);
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

<ProjectPaperView
    {backwardReferencedPapers}
    {criteriaWithReviews}
    {forwardReferencedPapers}
    loadingPaper={loadingProjectPaper}
    {loadingProject}
    {projectId}
    {reviewers}
/>
