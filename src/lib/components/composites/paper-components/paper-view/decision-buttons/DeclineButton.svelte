<script lang="ts">
    import DecisionButton from "./DecisionButton.svelte";

    interface Props {
        loadingPaperId: Promise<string>;
    }

    const { loadingPaperId }: Props = $props();
    let paperId: string | undefined = $state(undefined);
    loadingPaperId.then((id) => (paperId = id));

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
