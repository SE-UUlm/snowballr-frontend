<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import ReadingListEntry from "$lib/components/composites/paper-components/ReadingListEntry.svelte";
    import NamedList from "$lib/components/composites/list/NamedList.svelte";
    import ReadingListEntrySkeleton from "$lib/components/composites/paper-components/ReadingListEntrySkeleton.svelte";
    import SearchBar from "$lib/components/composites/search-bar/SearchBar.svelte";
    import { filterPapers } from "$lib/utils/filters";
    import type { Paper } from "$lib/model/api/paper";
    import { loadReadingList } from "./helper.js";
    import {
        getSearchTextFromURL,
        updateSearchTextParam,
        updateUrlParams,
    } from "$lib/utils/search-parameters";
    import { SvelteURLSearchParams } from "svelte/reactivity";
    import { page } from "$app/state";

    const { data } = $props();
    const { loadingReadingList } = $derived(data);

    let currentFullReadingList = $derived<Promise<Paper[]>>(loadingReadingList);
    let filteredReadingList = $derived<Promise<Paper[]>>(loadingReadingList);
    let currentSearchText = $state(getSearchTextFromURL());
    let noSearchResults = $state(false);
    let searchParameters = new SvelteURLSearchParams(page.url.searchParams.toString());

    $effect(() => {
        updateUrlParams(searchParameters);
    });

    function filterReadingList(searchText: string) {
        currentSearchText = searchText;

        filteredReadingList = currentFullReadingList.then((allEntries) => {
            const filteredPapers = filterPapers(allEntries, searchText);
            noSearchResults = filteredPapers.length === 0 && allEntries.length > 0;
            return filteredPapers;
        });
    }

    /**
     * This function is called when the bookmark status of a paper changes.
     * It fetches the updated reading list and updates the filtered reading list accordingly.
     * This is necessary to avoid showing a loading state when the bookmark status changes.
     */
    async function onPaperChangedBookmarkStatus() {
        try {
            const newFullReadingList = await loadReadingList();
            const newFilteredReadingList = filterPapers(newFullReadingList, currentSearchText);

            filteredReadingList = Promise.resolve(newFilteredReadingList);
            currentFullReadingList = Promise.resolve(newFullReadingList);
        } catch (error) {
            console.error("Error loading reading list:", error);
            filteredReadingList = Promise.reject(error);
        }
    }
</script>

<svelte:head>
    <title>Reading List</title>
</svelte:head>
<SimpleNavigationBar backRef="/" loadingTitle={Promise.resolve("Reading List")} />

<main class="mb-10 flex h-full w-full flex-row gap-x-10 overflow-hidden px-5">
    <NamedList
        emptyHint={noSearchResults
            ? "No papers on the reading list match your search."
            : "Your reading list is empty. Start adding papers from your SLRs to the reading list ..."}
        items={filteredReadingList}
        keySelector={(paper) => paper.id}
        listName=""
        numberOfSkeletons={7}
    >
        {#snippet preListContent()}
            <SearchBar
                onSearch={(text) => {
                    filterReadingList(text);
                    currentSearchText = text;
                    searchParameters = updateSearchTextParam(currentSearchText, searchParameters);
                }}
                timeoutInMs={0}
            />
        {/snippet}
        {#snippet listItemComponent(paper)}
            <ReadingListEntry {onPaperChangedBookmarkStatus} {paper} />
        {/snippet}
        {#snippet listItemSkeleton()}
            <ReadingListEntrySkeleton />
        {/snippet}
    </NamedList>
</main>
