<script lang="ts">
    import Bookmark from "lucide-svelte/icons/bookmark";
    import BookmarkPlus from "lucide-svelte/icons/bookmark-plus";
    import BookmarkMinus from "lucide-svelte/icons/bookmark-minus";
    import Tooltip from "./Tooltip.svelte";
    import { resource } from "$lib/resource.svelte";

    interface Props {
        loadingPaperId: Promise<string>;
        isBookmarkedDefault: boolean;
    }

    const { loadingPaperId, isBookmarkedDefault }: Props = $props();

    let isBookmarked = $state(isBookmarkedDefault);
    let isHovered = $state(false);
    const tooltipText = $derived(isBookmarked ? "Remove from Reading List" : "Add to Reading List");
    const paperId = resource<string, string | undefined>(loadingPaperId, {
        initialValue: undefined,
        resourceName: "paper ID",
    });

    const onMouseEnter = () => (isHovered = true);
    const onMouseLeave = () => (isHovered = false);

    function onClick() {
        if (isBookmarked) {
            removePaperFromReadingList();
        } else {
            addPaperToReadingList();
        }
    }

    function addPaperToReadingList() {
        // TODO: Will be implemented in #99
        isBookmarked = true;
        console.log(`Added paper with id ${paperId.value} to reading list`);
    }
    function removePaperFromReadingList() {
        // TODO: Will be implemented in #100
        isBookmarked = false;
        console.log(`Removed paper with id ${paperId.value} from reading list`);
    }
</script>

<!--
@component
Button to add a paper to or remove a paper from the reading list.

This component will handle the API calls itself.
According to bookmark state of the paper (isBookmarked), the button will change its appearance.

Usage:
```svelte
<PaperBookmarkButton paperId={42} isBookmarked={false} />
```
-->
<Tooltip
    class="border border-container-border-grey bg-transparent hover:bg-transparent text-primary p-1.5 w-fit h-fit"
    aria-label={tooltipText}
    onclick={onClick}
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
>
    {#snippet trigger()}
        {#if isHovered}
            {#if isBookmarked}
                <BookmarkMinus />
            {:else}
                <BookmarkPlus />
            {/if}
        {:else if isBookmarked}
            <Bookmark fill="bg-primary" />
        {:else}
            <Bookmark />
        {/if}
    {/snippet}
    {#snippet content()}
        <p>{tooltipText}</p>
    {/snippet}
</Tooltip>
