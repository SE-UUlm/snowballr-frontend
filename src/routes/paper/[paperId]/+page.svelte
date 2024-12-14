<script lang="ts">
    import PaperView from "$lib/components/composites/paper-components/paper-view/PaperView.svelte";
    import { getCurrentUser } from "$lib/current-user.js";

    const { data } = $props();
    const { user, loadingPaper, backwardReferencedPapers, forwardReferencedPapers } = data;
    const user = getCurrentUser();
</script>

<svelte:head>
    {#await loadingPaper}
        <title>Loading paper...</title>
    {:then paper}
        <title>{paper.title}</title>
    {:catch}
        <title>Failed loading paper</title>
    {/await}
</svelte:head>
<PaperView
    backRef="/"
    {backwardReferencedPapers}
    criteriaWithReviews={undefined}
    {forwardReferencedPapers}
    {loadingPaper}
    loadingProject={undefined}
    reviewers={undefined}
    {user}
    userConfig={{ isReviewMode: false }}
/>
