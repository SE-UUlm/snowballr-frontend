<script lang="ts">
    import Bookmark from "lucide-svelte/icons/bookmark";
    import BookmarkPlus from "lucide-svelte/icons/bookmark-plus";
    import BookmarkMinus from "lucide-svelte/icons/bookmark-minus";
    import Tooltip from "./utils/Tooltip.svelte";
    import { resource } from "$lib/resource.svelte";
    import { onMount } from "svelte";

    interface Props {
        loadingPaperId: Promise<string>;
        isBookmarkedDefault?: boolean;
    }

    const { loadingPaperId, isBookmarkedDefault = false }: Props = $props();

    let isBookmarked = $state(isBookmarkedDefault);
    let isHovered = $state(false);
    const tooltipText = $derived(isBookmarked ? "Remove from reading list" : "Add to reading list");
    const paperId = $derived(
        resource<string, string | undefined>(loadingPaperId, {
            initialValue: undefined,
            resourceName: "paper ID",
        }),
    );

    const onMouseEnter = () => (isHovered = true);
    const onMouseLeave = () => (isHovered = false);

    /**
     * Adds the paper to the reading list, if it is not added yet, otherwise removes it.
     */
    function toggleBookmarkState() {
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

    onMount(() => {
        if (isBookmarkedDefault) {
            addPaperToReadingList();
        }
    });
</script>

<!--
@component
Button to add a paper to or remove a paper from the reading list.

This component will handle the API calls itself.
According to bookmark state of the paper (isBookmarked), the button will change its appearance.

By setting the `isBookmarkedDefault` property, the default state for the button can be set, i.e.
if set to true, the paper with the given id is added to the reading list per default.

Usage:
```svelte
<PaperBookmarkButton loadingPaperId={Promise.resolve("42")} isBookmarkedDefault={true} />
```
-->
<Tooltip
    class="text-primary bg-transparent [&_svg]:size-6"
    aria-label={tooltipText}
    onclick={toggleBookmarkState}
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
