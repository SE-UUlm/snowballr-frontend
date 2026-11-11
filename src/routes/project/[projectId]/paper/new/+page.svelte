<script lang="ts">
    import PaperView from "$lib/components/composites/paper-components/paper-view/PaperView.svelte";
    import { emptyPaper } from "$lib/api/paper";
    import type { Paper } from "$lib/api/types";

    const { data } = $props();
    const { projectId, loadingProject, creationTarget } = $derived(data);

    const paper: Paper = emptyPaper();
    // Show an empty year field instead of 0.
    paper.year = "" as unknown as number;
</script>

<svelte:head>
    {#await loadingProject}
        <title>Loading Project...</title>
    {:then project}
        <title>Add Paper | {project.name}</title>
    {:catch}
        <title>Add Paper</title>
    {/await}
</svelte:head>
<PaperView
    allowEditModeToggle
    backRef={`/project/${projectId}/papers`}
    backwardReferencedPapers={Promise.resolve([])}
    {creationTarget}
    criteriaWithReviews={undefined}
    forwardReferencedPapers={Promise.resolve([])}
    loadingPaper={Promise.resolve(paper)}
    reviewers={undefined}
    startInEditMode
/>
