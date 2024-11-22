<script lang="ts">
    import ArrowLeft from "lucide-svelte/icons/arrow-left";
    import ArrowRight from "lucide-svelte/icons/arrow-right";
    import Tooltip from "../../Tooltip.svelte";
    import { goto } from "$app/navigation";

    interface Props {
        direction: "left" | "right";
        href: string;
        onClick?: () => void;
    }

    const { direction, href, onClick }: Props = $props();
</script>

<Tooltip
    class="bg-slate-200 hover:bg-slate-400 text-primary flex-grow max-w-xs shadow-lg min-w-32"
    buttonVariant="link"
    onclick={() => {
        if (onClick) onClick();
        goto(href);
    }}
>
    {#snippet trigger()}
        {#if direction === "left"}
            <ArrowLeft />
        {:else}
            <ArrowRight />
        {/if}
    {/snippet}
    {#snippet content()}
        {#if direction === "left"}
            <p>Previous paper</p>
        {:else}
            <p>Next paper</p>
        {/if}
    {/snippet}
</Tooltip>
