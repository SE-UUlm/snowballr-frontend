<script lang="ts">
    import PaperView from "$lib/components/composites/paper-components/paper-view/PaperView.svelte";
    import { Paper } from "$api/paper.js";

    const { data } = $props();
    const { projectId, loadingProject } = $derived(data);

    const paper: Paper = Paper.create({
        year: "" as unknown as number,
    });
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
    backRef={`/project/${projectId}/dashboard`}
    backwardReferencedPapers={Promise.resolve([])}
    criteriaWithReviews={undefined}
    forwardReferencedPapers={Promise.resolve([])}
    isInCreationMode
    loadingPaper={Promise.resolve(paper)}
    reviewers={undefined}
    startInEditMode
/>
