<script lang="ts">
    import Bookmark from "lucide-svelte/icons/bookmark";
    import BookmarkPlus from "lucide-svelte/icons/bookmark-plus";
    import BookmarkMinus from "lucide-svelte/icons/bookmark-minus";
    import Tooltip from "./utils/Tooltip.svelte";
    import { resource } from "$lib/resource.svelte";
    import { backendService } from "$lib/grpc-api";

    interface Props {
        loadingPaperId: Promise<string>;
        isBookmarkedDefault?: boolean;
        onPaperChangedBookmarkStatus?: () => void;
    }

    const {
        loadingPaperId,
        isBookmarkedDefault = false,
        onPaperChangedBookmarkStatus = undefined,
    }: Props = $props();

    let isBookmarked = $state(isBookmarkedDefault);
    let isHovered = $state(false);
    const tooltipText = $derived(isBookmarked ? "Remove from reading list" : "Add to reading list");
    const paperId = $derived(
        resource<string, string | undefined>(loadingPaperId, {
            initialValue: undefined,
            resourceName: "paper id",
        }),
    );

    let isUpdatingBookmarkStatus = $state(false);

    const onMouseEnter = () => (isHovered = true);
    const onMouseLeave = () => (isHovered = false);

    /**
     * Fetches the actual bookmark status when the paper id becomes available.
     * Uses a cleanup function to handle cases where the paper id changes before the fetch completes.
     */
    $effect(() => {
        const currentPaperId = paperId.value;
        let cancelled = false;

        if (currentPaperId) {
            isUpdatingBookmarkStatus = true;

            backendService
                .isPaperOnReadingList({ id: currentPaperId })
                .response.then((response) => {
                    if (cancelled) return;

                    isBookmarked = response.value;
                })
                .catch((error) => {
                    if (cancelled) return;

                    console.error(`Failed to fetch bookmark status for ${currentPaperId}:`, error);
                })
                .finally(() => {
                    if (cancelled) return;

                    // If cancelled, `isUpdatingBookmarkStatus` should already be false from cleanup
                    isUpdatingBookmarkStatus = false;
                });

            // --- Cleanup Function ---
            // Runs IF the dependency (currentPaperId) changes *before*
            // the promise settles, OR when the component is unmounted.
            return () => {
                cancelled = true;
                // Reset loading status immediately if the source id changes mid-flight
                isUpdatingBookmarkStatus = false;
            };
        } else {
            isUpdatingBookmarkStatus = false; // Ensure loading is false if id is invalid
        }
    });

    /**
     * Adds the paper to the reading list, if it is not already added yet, otherwise removes it.
     */
    function toggleBookmarkStatus() {
        if (paperId.value === undefined) {
            console.error("Paper id is undefined");
            isUpdatingBookmarkStatus = false;
            return;
        }

        if (isBookmarked) {
            backendService
                .removePaperFromReadingList({ id: paperId.value })
                .response.then(() => {
                    isBookmarked = false;
                    onPaperChangedBookmarkStatus?.();
                })
                .catch((error) => {
                    console.error("Error removing paper from reading list:", error);
                })
                .finally(() => {
                    isUpdatingBookmarkStatus = false;
                });
        } else {
            backendService
                .addPaperToReadingList({ id: paperId.value })
                .response.then(() => {
                    isBookmarked = true;
                    onPaperChangedBookmarkStatus?.();
                })
                .catch((error) => {
                    console.error("Error adding paper to reading list:", error);
                })
                .finally(() => {
                    isUpdatingBookmarkStatus = false;
                });
        }
    }
</script>

<!--
@component
Button to add a paper to or remove a paper from the reading list.

This component will handle the API calls itself.
If `isBookmarkedDefault` is set, it will show the initial state of the bookmark button.
After the initial state is set, the component will fetch the bookmark status of the paper from the backend.

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
        loadingPaperId={Promise.resolve(paperId)}
        isBookmarkedDefault={true}
        onPaperChangedBookmarkStatus={ChangedBookmarkStatusLogging}
    />
```
-->
<Tooltip
    class="text-primary bg-transparent [&_svg]:size-6"
    aria-label={tooltipText}
    disabled={isUpdatingBookmarkStatus}
    onclick={toggleBookmarkStatus}
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
