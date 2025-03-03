<script lang="ts">
    import { Skeleton } from "$lib/components/primitives/skeleton";
    import type { Paper } from "$lib/model/api/paper";
    import { getNames } from "$lib/utils/common-helper";
    import ErrorIndicator from "../ErrorIndicator.svelte";

    interface Props {
        loadingPaper: Promise<Paper | Omit<Paper, "id">>;
    }

    const { loadingPaper }: Props = $props();
</script>

{#await loadingPaper}
    <div class="grid grid-flow-row gap-1.5">
        <Skeleton class="h-6 w-56 rounded-full sm:w-80 md:w-[30rem] lg:w-[44rem]" />
        <Skeleton class="h-[1.125rem] w-28 rounded-full sm:w-40 md:w-[15rem] lg:w-[22rem]" />
    </div>
{:then paper}
    <div class="grid grid-flow-row gap-0">
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
