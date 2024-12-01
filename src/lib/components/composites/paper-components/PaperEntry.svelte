<script lang="ts">
    import PaperInfo from "$lib/components/composites/paper-components/PaperInfo.svelte";
    import { type Paper, ReviewDecision } from "$lib/model/backend";

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
    class="w-full border {showReviewStatus
        ? 'border-l-0'
        : ''} border-container-border-grey rounded-md"
>
    <div
        class="{showReviewStatus
            ? `border-l-4 ${reviewDecisionColor[paper.reviewData?.finalDecision ?? 'unreviewed']}`
            : ''} rounded-md px-3 py-1.5"
    >
        <PaperInfo {paper} />
    </div>
</div>
