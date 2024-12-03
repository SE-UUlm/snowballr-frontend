<script lang="ts">
    import PaperInfo from "$lib/components/composites/paper-components/PaperInfo.svelte";
    import { type Paper, ReviewDecision } from "$lib/model/backend";
    import UserAvatar from "$lib/components/composites/user-avatar/UserAvatar.svelte";
    import { goto } from "$app/navigation";

    interface PaperEntryProps {
        paper: Paper;
        projectId: number;
        showReviewStatus?: boolean;
        onClick?: () => void;
    }

    const navigateToPaperView = () => goto(`/project/${projectId}/paper/${paper.id}`);

    const {
        paper,
        projectId,
        showReviewStatus = false,
        onClick = navigateToPaperView,
    }: PaperEntryProps = $props();

    // Mapping of review decision to border color of paper list entry
    const reviewDecisionColor: Record<ReviewDecision | "unreviewed", string> = {
        [ReviewDecision.Accepted]: "border-accept-green",
        [ReviewDecision.Maybe]: "border-maybe-yellow",
        [ReviewDecision.Declined]: "border-decline-red",
        ["unreviewed"]: "border-unreviewed-gray",
    };

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    /**
     * Handles the click event of the paper entry component by checking
     * whether it was a single click (so no further click after 250ms) or a double click
     * and call the corresponding functions:
     *  - single click => onClick() (possible overridden, otherwise navigateToPaperView())
     *  - double click => navigateToPaperView() (default)
     *
     * @param e - the click event
     */
    const handleClick = (e: MouseEvent) => {
        if (e.detail === 1) {
            if (timeoutId !== null) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => onClick(), 250);
        } else if (e.detail === 2) {
            if (timeoutId !== null) clearTimeout(timeoutId);
            navigateToPaperView();
        }
    };
</script>

<!--
@component
Container displaying important paper information, optionally with review information.

This component shows the
  - paper id
  - title
  - authors (or 'unknown authors' if none are specified)
as well as, if not in review mode, the review information about this paper.

Furthermore this component is clickable and navigates to the corresponding paper view,
if the event handler is not overridden.

Usage:
```svelte
    <PaperEntry paper={paper} projectId={1} showReviewStatus={true} />
```
-->
<button
    type="button"
    class="flex flex-row items-center justify-end pe-3 gap-3 w-full border {showReviewStatus
        ? 'border-l-0'
        : ''} border-container-border-grey rounded-md"
    onclick={handleClick}
>
    <div
        class="flex flex-auto {showReviewStatus
            ? `border-l-4 ${reviewDecisionColor[paper.reviewData?.finalDecision ?? 'unreviewed']}`
            : ''} rounded-md px-3 py-1.5"
    >
        <PaperInfo {paper} />
    </div>
    {#if paper.reviewData !== undefined && showReviewStatus}
        {#each paper.reviewData.reviews as review}
            <UserAvatar user={review.user} reviewDecision={review.decision} />
        {/each}
    {/if}
</button>
