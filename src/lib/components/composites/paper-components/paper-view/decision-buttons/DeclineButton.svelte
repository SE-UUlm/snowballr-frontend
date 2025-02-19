<script lang="ts">
    import DecisionButton from "./DecisionButton.svelte";

    interface Props {
        loadingPaperId: Promise<string>;
    }

    const { loadingPaperId }: Props = $props();

    function declinePaper(paperId: string) {
        console.log(`Declined paper with id ${paperId}`);
    }
</script>

<DecisionButton
    class="bg-decline-red hover:bg-decline-red-hover"
    {loadingPaperId}
    onClick={declinePaper}
>
    {#snippet buttonContent()}
        <p>Decline</p>
        <p class="text-decline-red-shortcut">Ctrl+D</p>
    {/snippet}
    {#snippet tooltipContent()}
        <p>Decline Paper</p>
    {/snippet}
</DecisionButton>
