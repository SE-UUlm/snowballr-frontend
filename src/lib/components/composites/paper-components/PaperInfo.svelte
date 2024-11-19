<script lang="ts">
    import type { PaperData } from "../../../../app";

    interface Props {
        paper: { id: number | undefined; data: PaperData };
    }

    const { paper }: Props = $props();
</script>

<div class="grid grid-flow-row gap-0">
    <div class="grid grid-flow-col gap-1 items-center">
        {#if paper.id}
            <div class="text-default-sb-nc text-neutral-500">#{paper.id}</div>
        {/if}
        <h2 class="place-content-center truncate">{paper.data.title}</h2>
    </div>
    <div class="text-hint truncate">
        {#if paper.data.authors.length > 0}
            {paper.data.authors.join(", ")}
        {:else}
            <span class="italic">unknown authors</span>
        {/if}
    </div>
</div>
