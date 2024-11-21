<script lang="ts">
    import { Button } from "$lib/components/primitives/button/index.js";
    import ArrowLeft from "lucide-svelte/icons/arrow-left";
    import ArrowRight from "lucide-svelte/icons/arrow-right";

    interface Props {
        direction: "left" | "right";
        href: string;
        onClick?: () => void;
    }

    const { direction, href, onClick }: Props = $props();
</script>

<Button
    class="bg-slate-200 hover:bg-slate-400 text-primary flex-grow max-w-xs shadow-lg min-w-32"
    {href}
    onclick={onClick}
>
    {#if direction === "left"}
        <ArrowLeft />
    {:else}
        <ArrowRight />
    {/if}
</Button>
