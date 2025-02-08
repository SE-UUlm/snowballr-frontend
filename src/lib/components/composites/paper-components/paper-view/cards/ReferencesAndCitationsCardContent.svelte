<script lang="ts">
    import NamedList from "$lib/components/composites/list/NamedList.svelte";
    import { PaperController } from "$lib/controller/paper-controller";
    import type { Paper } from "$lib/model/backend";
    import PaperListEntry from "../../PaperListEntry.svelte";
    import PaperListEntrySkeleton from "../../PaperListEntrySkeleton.svelte";

    interface Props {
        projectId?: number;
        loadingPaper: Promise<Paper>;
    }

    let { projectId, loadingPaper }: Props = $props();

    console.log(projectId);

    let backwardReferencedPapers = loadingPaper.then((paper) => {
        return Promise.all(
            paper.backwardReferencedPaperIds.map((id) => new PaperController(id).get()),
        );
    });
    let forwardReferencedPapers = loadingPaper.then((paper) => {
        return Promise.all(
            paper.forwardReferencedPaperIds.map((id) => new PaperController(id).get()),
        );
    });
</script>

<section class="flex flex-col h-full gap-5">
    <div class="flex h-full overflow-hidden">
        <NamedList
            listName="References"
            items={backwardReferencedPapers}
            showNumberOfListItems
            numberOfSkeletons={4}
        >
            {#snippet listItemComponent(paper)}
                <PaperListEntry {paper} {projectId} />
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
            numberOfSkeletons={4}
        >
            {#snippet listItemComponent(paper)}
                <PaperListEntry {paper} {projectId} />
            {/snippet}
            {#snippet listItemSkeleton()}
                <PaperListEntrySkeleton />
            {/snippet}
        </NamedList>
    </div>
</section>
