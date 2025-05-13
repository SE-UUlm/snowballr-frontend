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

    // `isUpdatingBookmarkStatus` is initially set to `true` to represent the loading state
    let isUpdatingBookmarkStatus = $state(true);

    const loadingBookmarkStatus = loadingPaperId.then((id) => checkInitialBookmarkStatus(id));
    const paperId = resource<string, string | undefined>(loadingPaperId, {
        initialValue: undefined,
        resourceName: "paper id",
    });

    const isBookmarked = resource<boolean, boolean>(loadingBookmarkStatus, {
        initialValue: isBookmarkedDefault,
        resourceName: "bookmark status",
    });
    const tooltipText = $derived(
        isBookmarked.value ? "Remove from reading list" : "Add to reading list",
    );
    let isHovered = $state(false);

    const onMouseEnter = () => (isHovered = true);
    const onMouseLeave = () => (isHovered = false);

    async function checkInitialBookmarkStatus(id: string) {
        return await backendService
            .isPaperOnReadingList({ id })
            .response.then((response) => response.value)
            .catch((error) => {
                console.error(`Failed to fetch bookmark status for ${id}:`, error);
                return false;
            })
            .finally(() => {
                isUpdatingBookmarkStatus = false;
            });
    }

    /**
     * Adds the paper to the reading list, if it is not already added yet, otherwise removes it.
     */
    function toggleBookmarkStatus() {
        isUpdatingBookmarkStatus = true;

        if (paperId.value === undefined) {
            console.error("Paper id is undefined");
            isUpdatingBookmarkStatus = false;
            return;
        }

        if (isBookmarked.value) {
            backendService
                .removePaperFromReadingList({ id: paperId.value })
                .response.then(() => {
                    isBookmarked.value = false;
                    onPaperChangedBookmarkStatus?.();
                })
                .catch((error) => {
                    console.error("Error removing paper from reading list:", error);
                });
        } else {
            backendService
                .addPaperToReadingList({ id: paperId.value })
                .response.then(() => {
                    isBookmarked.value = true;
                    onPaperChangedBookmarkStatus?.();
                })
                .catch((error) => {
                    console.error("Error adding paper to reading list:", error);
                });
        }

        isUpdatingBookmarkStatus = false;
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
            {#if isBookmarked.value}
                <BookmarkMinus />
            {:else}
                <BookmarkPlus />
            {/if}
        {:else if isBookmarked.value}
            <Bookmark fill="bg-primary" />
        {:else}
            <Bookmark />
        {/if}
    {/snippet}
    {#snippet content()}
        <p>{tooltipText}</p>
    {/snippet}
</Tooltip>
