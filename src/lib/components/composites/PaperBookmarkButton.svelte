<script lang="ts">
    import { buttonVariants } from "$lib/components/primitives/button/index.js";
    import Bookmark from "lucide-svelte/icons/bookmark";
    import BookmarkPlus from "lucide-svelte/icons/bookmark-plus";
    import BookmarkMinus from "lucide-svelte/icons/bookmark-minus";
    import { cn } from "$lib/utils";
    import Tooltip from "./Tooltip.svelte";

    interface Props {
        paperId: number;
        isBookmarked: boolean;
    }

    const { paperId, isBookmarked }: Props = $props();
    type BookmarkState = "added" | "not added" | "adding" | "removing";
    let state = $state<BookmarkState>(isBookmarked ? "added" : "not added");
    const tooltipText = $derived(
        state === "not added" || state === "adding"
            ? "Add to Reading List"
            : "Remove from Reading List",
    );

    function onMouseEnter() {
        switch (state) {
            case "added":
                state = "removing";
                break;
            case "not added":
                state = "adding";
                break;
            default:
                break;
        }
    }

    function onMouseLeave() {
        switch (state) {
            case "adding":
                state = "not added";
                break;
            case "removing":
                state = "added";
                break;
            default:
                break;
        }
    }

    function onClick() {
        switch (state) {
            case "not added":
            case "adding":
                addPaperToReadingList();
                break;
            case "removing":
            case "added":
                removePaperFromReadingList();
                break;
            default:
                throw new Error(`unexpected state '${state}'`);
        }
    }

    function addPaperToReadingList() {
        // TODO: Will be implemented in #99
        state = "added";
        console.log(`Added paper with id ${paperId} to reading list`);
    }
    function removePaperFromReadingList() {
        // TODO: Will be implemented in #100
        state = "not added";
        console.log(`Removed paper with id ${paperId} from reading list`);
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
    class={cn(
        buttonVariants(),
        "border border-container-border-grey bg-transparent hover:bg-transparent text-primary p-1.5 w-fit h-fit",
    )}
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    onclick={onClick}
    aria-label={tooltipText}
>
    {#snippet trigger()}
        {#if state === "added"}
            <Bookmark fill="bg-primary" />
        {:else if state === "adding"}
            <BookmarkPlus />
        {:else if state === "removing"}
            <BookmarkMinus />
        {:else}
            <Bookmark />
        {/if}
    {/snippet}
    {#snippet content()}
        <p>{tooltipText}</p>
    {/snippet}
</Tooltip>
