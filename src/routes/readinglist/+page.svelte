<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import ReadingListEntry from "$lib/components/composites/paper-components/ReadingListEntry.svelte";
    import NamedList from "$lib/components/composites/list/NamedList.svelte";
    import ReadingListEntrySkeleton from "$lib/components/composites/paper-components/ReadingListEntrySkeleton.svelte";
    import SearchBar from "$lib/components/composites/search-bar/SearchBar.svelte";
    import { filterPapers } from "$lib/utils/filters";
    import type { Paper } from "$lib/model/api/paper";

    const { data } = $props();
    const { user, loadingReadingList } = data;

    let filteredReadingList = $state<Promise<Paper[]>>(loadingReadingList);

    function filterReadingList(searchText: string) {
        filteredReadingList = loadingReadingList.then((allEntries) =>
            filterPapers(allEntries, searchText),
        );
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
            <ReadingListEntry {paper} />
        {/snippet}
        {#snippet listItemSkeleton()}
            <ReadingListEntrySkeleton />
        {/snippet}
    </NamedList>
</main>
