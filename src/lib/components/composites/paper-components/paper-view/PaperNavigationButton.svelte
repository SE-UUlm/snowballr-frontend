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
    const tooltipText = direction === "left" ? "Previous Paper" : "Next Paper";
</script>

<!--
@component
Button that navigates to the next or previous paper.

This component is used in the PaperView component to navigate between papers.
When the button is clicked, the `onClick` function is called and the user is navigated to the `href` location.

Usage:
```svelte
    <PaperNavigationButton
        direction="left"
        href="/papers/1"
        onClick={() => console.log("button was clicked")}
    />
```
-->
<Tooltip
    class="bg-slate-200 hover:bg-slate-400 text-primary flex-grow max-w-xs shadow-lg min-w-32"
    buttonVariant="link"
    onclick={() => {
        if (onClick) onClick();
        goto(href);
    }}
    aria-label={tooltipText}
>
    {#snippet trigger()}
        {#if direction === "left"}
            <ArrowLeft />
        {:else}
            <ArrowRight />
        {/if}
    {/snippet}
    {#snippet content()}
        <p>{tooltipText}</p>
    {/snippet}
</Tooltip>
