<script lang="ts">
    import PaperView from "$lib/components/composites/paper-components/paper-view/PaperView.svelte";

    const { data } = $props();
    const { user, loadingPaper, backwardReferencedPapers, forwardReferencedPapers } = data;
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
    {user}
    {loadingPaper}
    {backwardReferencedPapers}
    {forwardReferencedPapers}
    backRef="/"
    userConfig={{ isReviewMode: false, showMaybeButton: false }}
/>
