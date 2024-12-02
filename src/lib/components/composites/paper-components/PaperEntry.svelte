<script lang="ts">
    import PaperInfo from "$lib/components/composites/paper-components/PaperInfo.svelte";
    import { type Paper, ReviewDecision } from "$lib/model/backend";
    import UserAvatar from "$lib/components/composites/user-avatar/UserAvatar.svelte";

    interface PaperEntryProps {
        paper: Paper;
        showReviewStatus: boolean;
        onClick?: () => void;
    }
    const onClickHandler = () => {};

    const { paper, showReviewStatus = false, onClick = onClickHandler }: PaperEntryProps = $props();

    const reviewDecisionColor: Record<ReviewDecision | "unreviewed", string> = {
        [ReviewDecision.Accepted]: "border-accept-green",
        [ReviewDecision.Maybe]: "border-maybe-yellow",
        [ReviewDecision.Declined]: "border-decline-red",
        ["unreviewed"]: "border-unreviewed-gray",
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
    <PaperEntry paper={paper} showReviewStatus={true} />
```
-->
<div
    class="flex flex-row items-center justify-end pe-3 gap-3 w-full border {showReviewStatus
        ? 'border-l-0'
        : ''} border-container-border-grey rounded-md"
>
    <div
        class="flex flex-auto {showReviewStatus
            ? `border-l-4 ${reviewDecisionColor[paper.reviewData?.finalDecision ?? 'unreviewed']}`
            : ''} rounded-md px-3 py-1.5"
    >
        <PaperInfo {paper} />
    </div>
    {#if paper.reviewData !== undefined}
        {#each paper.reviewData.reviews as review}
            <UserAvatar user={review.user} reviewDecision={review.decision} />
        {/each}
    {/if}
</div>
