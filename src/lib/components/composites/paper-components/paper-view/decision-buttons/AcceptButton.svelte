<script lang="ts">
    import { shortcuts } from "$lib/global-state/shortcuts-visibility-state.svelte";
    import DecisionButton from "./DecisionButton.svelte";

    interface Props {
        loadingPaperId: Promise<string>;
    }

    const { loadingPaperId }: Props = $props();

    function acceptPaper(paperId: string) {
        console.log(`Accepted paper with id ${paperId}`);
    }
</script>

<DecisionButton
    class="bg-accept-green hover:bg-accept-green-hover"
    {loadingPaperId}
    onClick={acceptPaper}
>
    {#snippet buttonContent()}
        <p>Accept</p>
        {#if shortcuts.isVisible}
            <p class="text-accept-green-shortcut">Ctrl+A</p>
        {/if}
    {/snippet}
    {#snippet tooltipContent()}
        <p>Accept Paper</p>
    {/snippet}
</DecisionButton>
