<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import ReadingListEntry from "$lib/components/composites/paper-components/ReadingListEntry.svelte";
    import NamedList from "$lib/components/composites/list/NamedList.svelte";
    import ReadingListEntrySkeleton from "$lib/components/composites/paper-components/ReadingListEntrySkeleton.svelte";

    const { data } = $props();
    const { user, loadingReadingList } = data;
</script>

<svelte:head>
    <title>Reading List</title>
</svelte:head>
<SimpleNavigationBar backRef="/" loadingTitle={Promise.resolve("Reading List")} {user} />

<main class="mb-10 flex h-full w-full flex-row gap-x-5 overflow-hidden">
    <NamedList
        emptyHint="Your reading list is empty. Start adding papers from your SLRs to the reading list ..."
        items={loadingReadingList}
        keySelector={(readingListEntry) => readingListEntry.paper.id}
        listName=""
        numberOfSkeletons={7}
    >
        {#snippet listItemComponent(componentData)}
            <ReadingListEntry {...componentData} />
        {/snippet}
        {#snippet listItemSkeleton()}
            <ReadingListEntrySkeleton />
        {/snippet}
    </NamedList>
</main>
