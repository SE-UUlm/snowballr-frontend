<script lang="ts">
    import { goto } from "$app/navigation";
    import { handleSingleOrDoubleClick } from "$lib/utils/common-helper";
    import PaperInfo from "$lib/components/composites/paper-components/PaperInfo.svelte";
    import PaperBookmarkButton from "$lib/components/composites/PaperBookmarkButton.svelte";
    import DownloadButton from "$lib/components/composites/DownloadButton.svelte";
    import type { Paper } from "$lib/model/api/paper";

    interface ReadingListEntryProps {
        paper: Paper;
        onClick?: () => void;
        onPaperChangedBookmarkStatus?: () => void;
    }

    const {
        paper,
        onClick,
        onPaperChangedBookmarkStatus = undefined,
    }: ReadingListEntryProps = $props();
    const { id, ...paperWithoutId } = paper;

    const href = `/paper/${id}`;
</script>

<!--
@component
Container displaying the information of a paper on the reading list.

This component shows the
  - title of the paper
  - authors (or 'unknown authors' if none are specified)

Furthermore this component is clickable and navigates to the corresponding paper view,
if the onClick() event handler is not overridden. Otherwise it executes the custom event handler
on a single click. A double click always causes the navigation to the paper view.

In addition, it is possible to provide a callback function `onPaperChangedBookmarkStatus()`
that is propagated to the `PaperBookmarkButton` and defines the behavior
what happens when the bookmark status of the paper changes.
This callback is executed when the bookmark status changes.

Usage:
```svelte
    <ReadingListEntry {paper} {onClick} {onPaperChangedBookmarkStatus} />
```
-->
<div
    class="border-container-border-grey highlight-on-hover flex w-full flex-row items-center gap-16 rounded-md border px-3 py-2"
>
    <svelte:element
        this={!onClick ? "a" : "button"}
        class="flex flex-auto"
        aria-label="Paper info for reading list entry"
        onclick={handleSingleOrDoubleClick(onClick ?? (() => {}), () => goto(href))}
        {...!onClick ? { href: href } : { type: "button" }}
    >
        <PaperInfo class="gap-1" loadingPaper={Promise.resolve(paperWithoutId)} />
    </svelte:element>
    <div class="flex flex-row items-center gap-4">
        <PaperBookmarkButton
            isBookmarkedDefault={true}
            loadingPaperId={Promise.resolve(id)}
            {onPaperChangedBookmarkStatus}
        />
        <DownloadButton loadingPaperId={Promise.resolve(id)} />
    </div>
</div>
