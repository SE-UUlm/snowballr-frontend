<script lang="ts">
    import Tooltip from "$lib/components/composites/Tooltip.svelte";

    interface Props {
        triggerText: string;
        contentText: string;
        openOnClick?: boolean;
    }

    const { triggerText, contentText, openOnClick }: Props = $props();
</script>

<Tooltip {openOnClick}>
    {#snippet trigger()}
        {triggerText}
    {/snippet}
    {#snippet content()}
        {contentText}
    {/snippet}
</Tooltip>
