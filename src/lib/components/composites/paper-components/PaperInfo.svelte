<script lang="ts">
    import type { Paper } from "$lib/model/api/paper";
    import { getNames } from "$lib/utils/common-helper";
    import ErrorIndicator from "../utils/ErrorIndicator.svelte";
    import type { WithElementRef } from "bits-ui";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "$lib/utils/shadcn-helper";
    import PaperInfoSkeleton from "$lib/components/composites/paper-components/PaperInfoSkeleton.svelte";

    type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
        loadingPaper: Promise<Paper | Omit<Paper, "id">>;
    };

    const { loadingPaper, class: className }: Props = $props();
</script>

{#await loadingPaper}
    <PaperInfoSkeleton />
{:then paper}
    <div class={cn("grid grid-flow-row gap-0", className)}>
        <div class="flex flex-row items-center gap-1 truncate">
            {#if "id" in paper}
                <div class="text-default-sb-nc w-fit text-neutral-500">#{paper.id}</div>
            {/if}
            <h2 class="place-content-center truncate">{paper.title}</h2>
        </div>
        <div class="text-hint flex flex-row items-center truncate">
            {#if paper.authors.length > 0}
                <span class="place-content-start truncate">{getNames(paper.authors)}</span>
            {:else}
                <span class="italic">unknown authors</span>
            {/if}
        </div>
    </div>
{:catch}
    <ErrorIndicator errorMessage="Couldn't load paper" />
{/await}
