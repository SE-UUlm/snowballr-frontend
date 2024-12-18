<script lang="ts">
    import DecisionButton from "./DecisionButton.svelte";

    const { paperId }: { paperId: number } = $props();

    function markPaperAsUndecided() {
        console.log(`Undecided paper with id ${paperId}`);
    }
</script>

<DecisionButton class="bg-maybe-yellow hover:bg-maybe-yellow-hover" onClick={markPaperAsUndecided}>
    {#snippet buttonContent()}
        <p>Maybe</p>
        <p class="text-maybe-yellow-shortcut">Ctrl+S</p>
    {/snippet}
    {#snippet tooltipContent()}
        <p>Mark Paper as undecided</p>
    {/snippet}
</DecisionButton>
