<script lang="ts">
    import PaperView from "$lib/components/composites/paper-components/paper-view/PaperView.svelte";

    const { data } = $props();
    const { user, loadingPaper } = data;
</script>

<svelte:head>
    {#await loadingPaper}
        <title>Loading Paper...</title>
    {:then paper}
        <title>{paper.title}</title>
    {:catch}
        <title>Error</title>
    {/await}
</svelte:head>
<PaperView
    {user}
    {loadingPaper}
    backRef="/"
    userConfig={{ isReviewMode: false, showMaybeButton: false }}
/>
