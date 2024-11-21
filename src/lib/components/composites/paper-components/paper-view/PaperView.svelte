<script lang="ts">
    import PaperNavigationBar from "$lib/components/composites/navigation-bar/PaperNavigationBar.svelte";
    import PaperDetailsCard from "$lib/components/composites/paper-components/paper-view/cards/PaperDetailsCard.svelte";
    import PaperResearchContextCard from "$lib/components/composites/paper-components/paper-view/cards/PaperResearchContextCard.svelte";
    import type { Paper, User } from "../../../../../app";
    import PaperBookmarkButton from "../../PaperBookmarkButton.svelte";
    import PaperNavigationButton from "./PaperNavigationButton.svelte";

    interface Props {
        user: User;
        paper: Paper;
        showNavigationButtons: boolean;
    }

    const { user, paper, showNavigationButtons }: Props = $props();
</script>

<div class="flex flex-row justify-between h-fit w-full gap-4">
    <PaperNavigationBar {user} backRef="/" {paper} />
    <PaperBookmarkButton paperId={paper.id} isBookmarked={paper.data.isBookmarked} />
</div>
<main class="flex flex-col h-full w-full px-2 py-4 gap-5">
    <div class="flex flex-row w-full h-full gap-5">
        <PaperDetailsCard />
        <PaperResearchContextCard />
    </div>
    {#if showNavigationButtons}
        <div class="flex flex-row w-full h-fit justify-between gap-4">
            <!-- TODO: Implementation of navigation buttons will be done in #46 and #47 -->
            <PaperNavigationButton direction="left" href={`/paper/${paper.id}`} />
            <PaperNavigationButton direction="right" href={`/paper/${paper.id}`} />
        </div>
    {/if}
</main>
