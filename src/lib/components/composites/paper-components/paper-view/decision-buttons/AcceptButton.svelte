<script lang="ts">
    import DecisionButton from "./DecisionButton.svelte";

    interface Props {
        loadingPaperId: Promise<string>;
    }

    const { loadingPaperId }: Props = $props();
    let paperId: string | undefined = $state(undefined);
    loadingPaperId.then((id) => (paperId = id));

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
