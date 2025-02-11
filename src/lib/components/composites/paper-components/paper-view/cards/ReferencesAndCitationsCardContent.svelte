<script lang="ts">
    import NamedList from "$lib/components/composites/list/NamedList.svelte";
    import SearchBar from "$lib/components/composites/search-bar/SearchBar.svelte";
    import { Fzf } from "fzf";
    import PaperListEntry from "../../PaperListEntry.svelte";
    import PaperListEntrySkeleton from "../../PaperListEntrySkeleton.svelte";
    import type { Paper } from "$lib/model/api/paper";

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

    function filterPapers(allPapers: Paper[], searchText: string) {
        const fzf = new Fzf(allPapers, {
            selector: (paper) => `#${paper!.id} ${paper!.title}`,
            casing: "case-insensitive",
        });
        return fzf.find(searchText).map((result) => result.item);
    }

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

<section class="flex flex-col h-full gap-5">
    <div class="flex h-full overflow-hidden">
        <NamedList
            listName="References"
            items={backwardReferencedPapers}
            showNumberOfListItems
            numberOfSkeletons={3}
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
    <div class="flex h-full overflow-hidden">
        <NamedList
            listName="Citations"
            items={forwardReferencedPapers}
            showNumberOfListItems
            numberOfSkeletons={3}
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
