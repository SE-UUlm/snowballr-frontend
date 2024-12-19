import { type Paper, ReviewDecision } from "$lib/model/backend";

/**
 * Calculate the progress of a stage.
 *
 * The progress is defined as the number of papers that are already accepted or declined (so no further
 * decision is required) relative to the total number of papers (including the unreviewed papers that need
 * the decision of the arbiter).
 *
 * If no papers are provided, the progress is set to 0 by default.
 *
 * @return the progress as integer percentage (from 0 to 100)
 */
function calculateStageProgress(papers: Paper[]) {
    const totalPapers = papers.length;
    if (totalPapers === 0) return 0;

    const decidedPapers = papers.filter(
        (paper) =>
            paper.reviewData !== undefined &&
            (paper.reviewData.finalDecision === ReviewDecision.Accepted ||
                paper.reviewData.finalDecision === ReviewDecision.Declined),
    ).length;

    return Math.round((decidedPapers / totalPapers) * 100);
}

export { calculateStageProgress };
