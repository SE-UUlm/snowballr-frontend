<script lang="ts">
    import type { Paper, PaperSpec } from "$lib/model/backend";

    interface Props {
        paper: Paper | PaperSpec;
    }

    const { paper }: Props = $props();
</script>

<div class="grid grid-flow-row gap-0">
    <div class="flex flex-row gap-1 items-center truncate">
        {#if "id" in paper}
            <div class="w-fit text-default-sb-nc text-neutral-500">#{paper.id}</div>
        {/if}
        <h2 class="place-content-center truncate">{paper.title}</h2>
    </div>
    <div class="flex flex-row items-center text-hint truncate">
        {#if paper.authors.length > 0}
            <span class="place-content-start truncate"
                >{paper.authors.map((a) => `${a.firstName} ${a.lastName}`).join(", ")}</span
            >
        {:else}
            <span class="italic">unknown authors</span>
        {/if}
    </div>
</div>
