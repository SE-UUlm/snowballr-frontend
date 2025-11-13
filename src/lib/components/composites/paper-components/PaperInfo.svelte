<script lang="ts">
    import type { Paper } from "$lib/model/api/paper";
    import { getNames } from "$lib/utils/common-helper";
    import ErrorIndicator from "../utils/ErrorIndicator.svelte";
    import type { WithElementRef } from "bits-ui";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "$lib/utils/shadcn-helper";
    import PaperInfoSkeleton from "$lib/components/composites/paper-components/PaperInfoSkeleton.svelte";
    import highlightWords from "highlight-words";
    import { getSearchTextFromURL } from "$lib/utils/search-parameters";

    type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
        loadingPaper: Promise<Omit<Paper, "id">>;
        loadingPaperId?: Promise<string>;
    };

    const { loadingPaper, loadingPaperId = undefined, class: className }: Props = $props();
    const safeSearchQuery = $derived(getSearchTextFromURL());

    function isUuid(id: string) {
        return Number.isNaN(Number(id));
    }
</script>

<!--
@component
Container for displaying basic paper information such as:
- paper title
- paper authors
- the id

The id is either the global paper id or, if this component is used for displaying basic information
for a project paper, the local / relative project paper id.

-->
{#await Promise.all([loadingPaper, loadingPaperId])}
    <PaperInfoSkeleton />
{:then [paper, id]}
    <div class={cn("grid grid-flow-row gap-0", className)}>
        <div class="flex flex-row items-center gap-1 truncate">
            {#if id}
                <div class="text-default-sb-nc w-fit text-neutral-500">
                    {#if isUuid(id)}
                        <span title={id}>#{id.substring(0, 8)}</span>
                    {:else}
                        #{id}
                    {/if}
                </div>
            {/if}
            <h2 class="place-content-center truncate">
                {#each highlightWords( { text: paper.title, query: safeSearchQuery, matchExactly: false }, ) as chunk (chunk.key)}
                    {#if chunk.match}
                        <span class="highlight">{chunk.text}</span>
                    {:else}
                        {chunk.text}
                    {/if}
                {/each}
            </h2>
        </div>
        <div class="text-hint flex flex-row items-center truncate">
            {#if paper.authors.length > 0}
                <span class="place-content-start truncate">
                    {#each highlightWords( { text: getNames(paper.authors), query: safeSearchQuery, matchExactly: false }, ) as chunk (chunk.key)}
                        {#if chunk.match}
                            <span class="highlight">{chunk.text}</span>
                        {:else}
                            {chunk.text}
                        {/if}
                    {/each}
                </span>
            {:else}
                <span class="italic">unknown authors</span>
            {/if}
        </div>
    </div>
{:catch}
    <ErrorIndicator errorMessage="Couldn't load paper" />
{/await}
