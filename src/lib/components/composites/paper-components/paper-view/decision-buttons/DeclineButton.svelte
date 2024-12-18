<script lang="ts">
    import DecisionButton from "./DecisionButton.svelte";

    const { paperId }: { paperId: number } = $props();

    function declinePaper() {
        console.log(`Declined paper with id ${paperId}`);
    }
</script>

<DecisionButton class="bg-decline-red hover:bg-decline-red-hover" onClick={declinePaper}>
    {#snippet buttonContent()}
        <p>Decline</p>
        <p class="text-decline-red-shortcut">Ctrl+D</p>
    {/snippet}
    {#snippet tooltipContent()}
        <p>Decline Paper</p>
    {/snippet}
</DecisionButton>
