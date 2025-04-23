<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import ReadingListEntry from "$lib/components/composites/paper-components/ReadingListEntry.svelte";
    import NamedList from "$lib/components/composites/list/NamedList.svelte";
    import ReadingListEntrySkeleton from "$lib/components/composites/paper-components/ReadingListEntrySkeleton.svelte";
    import SearchBar from "$lib/components/composites/search-bar/SearchBar.svelte";
    import { filterPapers } from "$lib/utils/filters";
    import type { Paper } from "$lib/model/api/paper";
    import { loadReadingList } from "./helper.js";

    const { data } = $props();
    const { user, loadingReadingList } = data;

    let currentFullReadingList = $state<Promise<Paper[]>>(loadingReadingList);
    let filteredReadingList = $state<Promise<Paper[]>>(loadingReadingList);
    let currentSearchText = $state<string>("");

    function filterReadingList(searchText: string) {
        currentSearchText = searchText;

        filteredReadingList = currentFullReadingList.then((allEntries) =>
            filterPapers(allEntries, searchText),
        );
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
<SimpleNavigationBar backRef="/" loadingTitle={Promise.resolve("Reading List")} {user} />

<main class="mb-10 flex h-full w-full flex-row gap-x-10 overflow-hidden px-5">
    <NamedList
        emptyHint="Your reading list is empty. Start adding papers from your SLRs to the reading list ..."
        items={filteredReadingList}
        keySelector={(paper) => paper.id}
        listName=""
        numberOfSkeletons={7}
    >
        {#snippet preListContent()}
            <SearchBar onSearch={filterReadingList} timeoutInMs={0} />
        {/snippet}
        {#snippet listItemComponent(paper)}
            <ReadingListEntry {onPaperChangedBookmarkStatus} {paper} />
        {/snippet}
        {#snippet listItemSkeleton()}
            <ReadingListEntrySkeleton />
        {/snippet}
    </NamedList>
</main>
