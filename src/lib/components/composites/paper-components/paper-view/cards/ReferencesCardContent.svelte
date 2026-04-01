<script lang="ts">
    import NamedList from "$lib/components/composites/list/NamedList.svelte";
    import SearchBar from "$lib/components/composites/search-bar/SearchBar.svelte";
    import PaperListEntry from "$lib/components/composites/paper-components/PaperListEntry.svelte";
    import PaperListEntrySkeleton from "$lib/components/composites/paper-components/PaperListEntrySkeleton.svelte";
    import type { Paper } from "$api/paper";
    import { filterPapers } from "$lib/utils/filters";

    interface Props {
        loadingReferencedPapers: Promise<Paper[]>;
        title: string;
    }

    let { loadingReferencedPapers: allReferencedPapers, title }: Props = $props();

    const titleLower = $derived(title.toLowerCase());

    let referencedPapers = $derived<Promise<Paper[]>>(allReferencedPapers);
    let hasSearchResults = $state(false);

    function filterReferencedPapers(searchText: string) {
        referencedPapers = allReferencedPapers.then((papers) => {
            const filteredPapers = filterPapers(papers, searchText);
            hasSearchResults = filteredPapers.length === 0 && papers.length > 0;
            return filteredPapers;
        });
    }
</script>

<!--
@component
Card Content for forward or backward references of a paper, used by `PaperResearchContextCard`.

Usage:
```svelte
    <ReferencesCardContent
        loadingReferencedPapers={forwardReferencedPapers}
        title="Forward References"
    />
```
-->
<section class="flex h-full flex-[1_1_0] overflow-hidden">
    <NamedList
        emptyHint={hasSearchResults
            ? `No ${titleLower} match your search.`
            : `No ${titleLower} exist or have been added.`}
        errorHint={`Couldn't load ${titleLower}.`}
        items={referencedPapers}
        keySelector={(paper) => paper.id}
        listName={title}
        numberOfSkeletons={3}
        showNumberOfListItems
    >
        {#snippet preListContent()}
            <SearchBar onSearch={filterReferencedPapers} timeoutInMs={0} />
        {/snippet}
        {#snippet listItemComponent(paper)}
            <PaperListEntry {paper} projectId={undefined} />
        {/snippet}
        {#snippet listItemSkeleton()}
            <PaperListEntrySkeleton />
        {/snippet}
    </NamedList>
</section>
