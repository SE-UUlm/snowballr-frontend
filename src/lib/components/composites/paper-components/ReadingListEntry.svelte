<script lang="ts">
    import { goto } from "$app/navigation";
    import { handleSingleOrDoubleClick } from "$lib/utils/common-helper";
    import type { ReadingListEntryInterface } from "$lib/model/component-interfaces";
    import PaperInfo from "$lib/components/composites/paper-components/PaperInfo.svelte";
    import PaperBookmarkButton from "$lib/components/composites/PaperBookmarkButton.svelte";
    import DownloadButton from "$lib/components/composites/DownloadButton.svelte";

    type ReadingListEntryProps = ReadingListEntryInterface & {
        onClick?: () => void;
    };

    const navigateToPaperView = () => {
        goto(`/paper/${id}`);
    };

    const { paper, onClick = navigateToPaperView }: ReadingListEntryProps = $props();
    const { id, ...paperWithoutId } = paper;

    let timeoutId: ReturnType<typeof setTimeout> | null = $state(null);
    const handleClick = () => {
        timeoutId = handleSingleOrDoubleClick(timeoutId, onClick, navigateToPaperView);
    };
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

Usage:
```svelte
    <ReadingListEntry paper={paper} />
```
-->
<div
    class="border-container-border-grey highlight-on-hover flex w-full flex-row items-center gap-16 rounded-md border-b px-5 py-1.5"
>
    <button
        class="flex flex-auto"
        aria-label="Paper info for reading list entry"
        onclick={handleClick}
        type="button"
    >
        <PaperInfo class="gap-1" loadingPaper={Promise.resolve(paperWithoutId)} />
    </button>
    <div class="flex flex-row items-center gap-4">
        <PaperBookmarkButton isBookmarkedDefault={true} loadingPaperId={Promise.resolve(id)} />
        <DownloadButton loadingPaperId={Promise.resolve(id)} />
    </div>
</div>
