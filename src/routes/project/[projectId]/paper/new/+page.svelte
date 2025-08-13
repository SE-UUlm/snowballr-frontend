<script lang="ts">
    import PaperView from "$lib/components/composites/paper-components/paper-view/PaperView.svelte";
    import { Paper } from "$lib/model/api/paper.js";

    const { data } = $props();
    const { projectId, loadingProject } = data;

    const paper: Paper = Paper.create({
        year: new Date().getFullYear(),
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
