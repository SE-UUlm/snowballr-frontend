<script lang="ts">
    import DecisionButton from "./DecisionButton.svelte";

    const { paperId }: { paperId: number } = $props();

    function acceptPaper() {
        console.log(`Accepted paper with id ${paperId}`);
    }
</script>

<DecisionButton class="bg-accept-green hover:bg-accept-green-hover" onClick={acceptPaper}>
    {#snippet buttonContent()}
        <p>Accept</p>
        <p class="text-accept-green-shortcut">Ctrl+A</p>
    {/snippet}
    {#snippet tooltipContent()}
        <p>Accept Paper</p>
    {/snippet}
</DecisionButton>
