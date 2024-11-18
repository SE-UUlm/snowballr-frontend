<script lang="ts">
    import type { Paper } from "../../../../app";

    interface Props {
        paper: Omit<Paper, "id"> & { id: number | undefined };
    }

    const { paper }: Props = $props();
</script>

<div class="grid grid-flow-row gap-0">
    <div class="grid grid-flow-col gap-1 items-center">
        {#if paper.id}
            <div class="text-hint">#{paper.id}</div>
        {/if}
        <h2 class="place-content-center truncate">{paper.title}</h2>
    </div>
    <div class="text-hint truncate">{paper.authors.join(", ")}</div>
</div>
