<script lang="ts">
    import PaperInfo from "$lib/components/composites/paper-components/PaperInfo.svelte";
    import type { Paper } from "../../../../app";
    import { ReviewStatus } from "../../../../types";

    interface PaperEntryProps {
        paper: Paper;
    }

    const { paper }: PaperEntryProps = $props();

    const reviewStatusColor: Record<ReviewStatus, string> = {
        [ReviewStatus.Unreviewed]: "border-unreviewed-gray",
        [ReviewStatus.Accepted]: "border-accept-green",
        [ReviewStatus.Maybe]: "border-maybe-yellow",
        [ReviewStatus.Declined]: "border-decline-red",
    };

    function showStatus(): boolean {
        return paper.showReviewStatus && paper.reviewData !== undefined;
    }
</script>

<div
    class="w-full border {showStatus() ? 'border-l-0' : ''} border-container-border-grey rounded-md"
>
    <div
        class="{showStatus()
            ? `border-l-4 ${reviewStatusColor[paper.reviewData.finalDecision]}`
            : ''} rounded-md px-3 py-1.5"
    >
        <PaperInfo {paper} />
    </div>
</div>
