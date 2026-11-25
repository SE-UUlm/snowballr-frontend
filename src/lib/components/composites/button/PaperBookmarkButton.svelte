<script lang="ts">
    import Bookmark from "@lucide/svelte/icons/bookmark";
    import BookmarkPlus from "@lucide/svelte/icons/bookmark-plus";
    import BookmarkMinus from "@lucide/svelte/icons/bookmark-minus";
    import Tooltip from "#lib/components/composites/utils/Tooltip.svelte";
    import { resource } from "#lib/resource.svelte.js";
    import {
        addPaperToReadingList,
        isPaperOnReadingList,
        removePaperFromReadingList,
    } from "#lib/api/reading-list.js";
    import { isApiError } from "#lib/api/errors.js";
    import { cn } from "#lib/utils/shadcn-helper.js";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";

    interface Props {
        paperId: string;
        isBookmarkedDefault?: boolean;
        onPaperChangedBookmarkStatus?: () => void;
        class?: string;
    }

    const {
        paperId,
        isBookmarkedDefault = false,
        onPaperChangedBookmarkStatus = undefined,
        class: className,
    }: Props = $props();

    // A new resource per paper, so a new `paperId` starts out pending again until its status arrives
    const bookmarkStatus = $derived(
        resource<boolean, boolean>(isPaperOnReadingList(paperId), {
            initialValue: isBookmarkedDefault,
            resourceName: "bookmark status",
        }),
    );
    let isTogglingBookmarkStatus = $state(false);
    // Without a loaded status, a click could add a paper that is already on the reading list
    const isBusy = $derived(bookmarkStatus.status === "pending" || isTogglingBookmarkStatus);
    const isDisabled = $derived(isBusy || bookmarkStatus.status === "rejected");
    const tooltipText = $derived.by(() => {
        if (bookmarkStatus.status === "rejected") {
            return "Couldn't load reading list status";
        }
        return bookmarkStatus.value ? "Remove from reading list" : "Add to reading list";
    });
    let isHovered = $state(false);

    const onMouseEnter = () => (isHovered = true);
    const onMouseLeave = () => (isHovered = false);

    /**
     * Adds the paper to the reading list, if it is not already added yet, otherwise removes it.
     */
    async function toggleBookmarkStatus() {
        // Keep the status of the paper the click was for, even if `paperId` changes meanwhile
        const clickedBookmarkStatus = bookmarkStatus;
        const id = paperId;
        isTogglingBookmarkStatus = true;

        try {
            if (clickedBookmarkStatus.value) {
                await removePaperFromReadingList(id);
                clickedBookmarkStatus.value = false;
            } else {
                await addPaperToReadingList(id);
                clickedBookmarkStatus.value = true;
            }
            onPaperChangedBookmarkStatus?.();
        } catch (error) {
            // A cancelled request was aborted on purpose, e.g. because the user navigated away
            if (isApiError(error, "cancelled")) {
                return;
            }
            console.error(`Failed to change the bookmark status of paper ${id}:`, error);
        } finally {
            isTogglingBookmarkStatus = false;
        }
    }
</script>

<!--
@component
Button to add a paper to or remove a paper from the reading list.

This component will handle the API calls itself.
If `isBookmarkedDefault` is set, it will show the initial state of the bookmark button.
After the initial state is set, the component will fetch the bookmark status of the paper from the backend.
The button stays disabled until the status has loaded, and if loading it fails.

Usage:
```svelte
    async function ChangedBookmarkStatusLogging() {
        const readingList = await loadReadingList().then(() => {
            console.log("Reading list updated");
        }).catch((error) => {
            console.error("Error loading reading list:", error);
        });
    }

    <PaperBookmarkButton
        {paperId}
        isBookmarkedDefault={true}
        onPaperChangedBookmarkStatus={ChangedBookmarkStatusLogging}
    />
```
-->
<Tooltip
    class={cn("text-primary bg-transparent [&_svg]:size-6", className)}
    aria-label={tooltipText}
    data-testid="paper-bookmark-btn"
    disabled={isDisabled}
    onclick={toggleBookmarkStatus}
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
>
    {#snippet trigger()}
        {#if isBusy}
            <LoaderCircle class="animate-spin" />
        {:else if isHovered}
            {#if bookmarkStatus.value}
                <BookmarkMinus />
            {:else}
                <BookmarkPlus />
            {/if}
        {:else if bookmarkStatus.value}
            <Bookmark fill="bg-primary" />
        {:else}
            <Bookmark />
        {/if}
    {/snippet}
    {#snippet content()}
        <p>{tooltipText}</p>
    {/snippet}
</Tooltip>
