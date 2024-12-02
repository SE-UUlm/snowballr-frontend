<script lang="ts">
    import PaperInfo from "$lib/components/composites/paper-components/PaperInfo.svelte";
    import { type Paper, ReviewDecision } from "$lib/model/backend";
    import UserAvatar from "$lib/components/composites/user-avatar/UserAvatar.svelte";

    interface PaperEntryProps {
        paper: Paper;
        showReviewStatus: boolean;
    }

    const { paper, showReviewStatus = false }: PaperEntryProps = $props();

    const reviewDecisionColor: Record<ReviewDecision | "unreviewed", string> = {
        [ReviewDecision.Accepted]: "border-accept-green",
        [ReviewDecision.Maybe]: "border-maybe-yellow",
        [ReviewDecision.Declined]: "border-decline-red",
        ["unreviewed"]: "border-unreviewed-gray",
    };
</script>

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
