<script lang="ts">
    import Bookmark from "lucide-svelte/icons/bookmark";
    import BookmarkPlus from "lucide-svelte/icons/bookmark-plus";
    import BookmarkMinus from "lucide-svelte/icons/bookmark-minus";
    import Tooltip from "$lib/components/composites/utils/Tooltip.svelte";
    import { resource } from "$lib/resource.svelte";
    import { backendService } from "$lib/grpc-api";
    import { cn } from "$lib/utils/shadcn-helper";
    import { LoaderCircle } from "lucide-svelte";

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

    // `isUpdatingBookmarkStatus` is initially set to `true` to represent the loading state
    let isUpdatingBookmarkStatus = $state(true);

    const loadingBookmarkStatus = checkInitialBookmarkStatus(paperId);
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
    async function toggleBookmarkStatus() {
        isUpdatingBookmarkStatus = true;

        if (isBookmarked.value) {
            await backendService
                .removePaperFromReadingList({ id: paperId })
                .response.then(() => {
                    isBookmarked.value = false;
                    onPaperChangedBookmarkStatus?.();
                })
                .catch((error) => {
                    console.error("Error removing paper from reading list:", error);
                });
        } else {
            await backendService
                .addPaperToReadingList({ id: paperId })
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
    disabled={isUpdatingBookmarkStatus}
    onclick={toggleBookmarkStatus}
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
>
    {#snippet trigger()}
        {#if isUpdatingBookmarkStatus}
            <LoaderCircle class="animate-spin" />
        {:else if isHovered}
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
