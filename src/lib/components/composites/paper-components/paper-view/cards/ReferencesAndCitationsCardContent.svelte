<script lang="ts">
    import NamedList from "$lib/components/composites/list/NamedList.svelte";
    import SearchBar from "$lib/components/composites/search-bar/SearchBar.svelte";
    import PaperListEntry from "../../PaperListEntry.svelte";
    import PaperListEntrySkeleton from "../../PaperListEntrySkeleton.svelte";
    import type { Paper } from "$lib/model/api/paper";
    import { filterPapers } from "$lib/utils/filters";

    export interface ReferencesAndCitationsCardContentProps {
        backwardReferencedPapers: Promise<Paper[]>;
        forwardReferencedPapers: Promise<Paper[]>;
    }

    let {
        backwardReferencedPapers: allBackwardReferencedPapers,
        forwardReferencedPapers: allForwardReferencedPapers,
    }: ReferencesAndCitationsCardContentProps = $props();

    let backwardReferencedPapers = $state<Promise<Paper[]>>(allBackwardReferencedPapers);
    let forwardReferencedPapers = $state<Promise<Paper[]>>(allForwardReferencedPapers);

    function filterBackwardReferencedPapers(searchText: string) {
        backwardReferencedPapers = allBackwardReferencedPapers.then((allPapers) =>
            filterPapers(allPapers, searchText),
        );
    }

    function filterForwardReferencedPapers(searchText: string) {
        forwardReferencedPapers = allForwardReferencedPapers.then((allPapers) =>
            filterPapers(allPapers, searchText),
        );
    }
</script>

<!--
@component
Card Content for references and citations of a paper, used by `PaperResearchContextCard`.

Usage:
```svelte
    <ReferencesAndCitationsCardContent {backwardReferencedPapers} {forwardReferencedPapers} />
```
-->
<section class="flex flex-col h-full gap-5">
    <div class="flex h-full overflow-hidden flex-[1_1_0]">
        <NamedList
            listName="References"
            items={backwardReferencedPapers}
            showNumberOfListItems
            numberOfSkeletons={3}
            emptyHint="No references found."
            errorHint="Couldn't load references."
        >
            {#snippet preListContent()}
                <SearchBar onSearch={filterBackwardReferencedPapers} timeoutInMs={0} />
            {/snippet}
            {#snippet listItemComponent(paper)}
                <PaperListEntry {paper} projectId={undefined} showReviewStatus={false} />
            {/snippet}
            {#snippet listItemSkeleton()}
                <PaperListEntrySkeleton />
            {/snippet}
        </NamedList>
    </div>
    <div class="flex h-full overflow-hidden flex-[1_1_0]">
        <NamedList
            listName="Citations"
            items={forwardReferencedPapers}
            showNumberOfListItems
            numberOfSkeletons={3}
            emptyHint="No citations found."
            errorHint="Couldn't load citations."
        >
            {#snippet preListContent()}
                <SearchBar onSearch={filterForwardReferencedPapers} timeoutInMs={0} />
            {/snippet}
            {#snippet listItemComponent(paper)}
                <PaperListEntry {paper} projectId={undefined} showReviewStatus={false} />
            {/snippet}
            {#snippet listItemSkeleton()}
                <PaperListEntrySkeleton />
            {/snippet}
        </NamedList>
    </div>
</section>
