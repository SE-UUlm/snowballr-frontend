<script lang="ts">
    import NamedList from "$lib/components/composites/list/NamedList.svelte";
    import SearchBar from "$lib/components/composites/search-bar/SearchBar.svelte";
    import { Fzf } from "fzf";
    import PaperListEntry from "../../PaperListEntry.svelte";
    import PaperListEntrySkeleton from "../../PaperListEntrySkeleton.svelte";
    import type { Paper } from "$lib/model/api/paper";
    import { backendService } from "$lib/grpc-api";
    import type { Project_Paper } from "$lib/model/api/project";
    import { resource } from "$lib/resource.svelte";

    interface Props {
        projectId?: string;
        loadingPaper: Promise<Paper>;
    }

    let { projectId, loadingPaper }: Props = $props();

    async function getReferencedPapers(paperIds: string[]): Promise<Project_Paper[]> {
        try {
            return await Promise.all(
                paperIds.map((id) => backendService.getProjectPaperById({ id }).response),
            );
        } catch (error) {
            console.error(`An error occurred while fetching referenced papers: ${error}`);
            return [];
        }
    }

    // References
    let allBackwardReferencedPapers = resource<Paper, Promise<Project_Paper[]>>(loadingPaper, {
        initialValue: Promise.resolve([]),
        onSuccess: (paper) => {
            backwardReferencedPapers = getReferencedPapers(paper.backwardReferencedIds);
            return backwardReferencedPapers;
        },
        onErrorValue: Promise.resolve([]),
    });
    let backwardReferencedPapers = $state<Promise<Project_Paper[]>>(Promise.resolve([]));

    // Citations
    let allForwardReferencedPapers = resource<Paper, Promise<Project_Paper[]>>(loadingPaper, {
        initialValue: Promise.resolve([]),
        onSuccess: (paper) => {
            // TODO: Replace with forwardReferencedIds
            forwardReferencedPapers = getReferencedPapers(paper.backwardReferencedIds);
            return forwardReferencedPapers;
        },
        onErrorValue: Promise.resolve([]),
    });
    let forwardReferencedPapers = $state<Promise<Project_Paper[]>>(Promise.resolve([]));

    function filterPapers(allPapers: Project_Paper[], searchText: string) {
        const fzf = new Fzf(allPapers, {
            selector: ({ paper }) => `#${paper!.id} ${paper!.title}`,
        });
        return fzf.find(searchText).map((result) => result.item);
    }

    function filterBackwardReferencedPapers(searchText: string) {
        backwardReferencedPapers = allBackwardReferencedPapers.value.then((allPapers) =>
            filterPapers(allPapers, searchText),
        );
    }

    function filterForwardReferencedPapers(searchText: string) {
        forwardReferencedPapers = allForwardReferencedPapers.value.then((allPapers) =>
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
            {#snippet listItemComponent(projectPaper)}
                <PaperListEntry {projectPaper} {projectId} />
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
            {#snippet listItemComponent(projectPaper)}
                <PaperListEntry {projectPaper} {projectId} />
            {/snippet}
            {#snippet listItemSkeleton()}
                <PaperListEntrySkeleton />
            {/snippet}
        </NamedList>
    </div>
</section>
