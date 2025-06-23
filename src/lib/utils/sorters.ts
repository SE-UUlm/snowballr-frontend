import { PaperDecision, type Project_Paper } from "$lib/model/api/project";
import { SortCriteria, SortDirection, type SortOption } from "$lib/model/sort-criteria";

/**
 * Compares two paper decisions based on a custom priority order:
 * ACCEPTED \> IN_REVIEW \> DECLINED \> UNREVIEWED
 *
 * @param a - The first decision
 * @param b - The second decision
 * @returns negative value if a tends more to 'Accepted', positive if a tends more to 'Unreviewed', 0 if equal (for sorting the papers)
 */
function comparePaperDecisions(a: PaperDecision, b: PaperDecision): number {
    const priority: Record<PaperDecision, number> = {
        [PaperDecision.UNSPECIFIED]: 4,
        [PaperDecision.UNREVIEWED]: 3,
        [PaperDecision.DECLINED]: 2,
        [PaperDecision.IN_REVIEW]: 1,
        [PaperDecision.ACCEPTED]: 0,
    };

    return priority[a] - priority[b];
}

/**
 * Sorts an array of project papers based on the given sorting option.
 *
 * @param papers - The array of project papers to be sorted.
 * @param sortOption - The criterion and direction used for sorting.
 * @returns the sorted array of project papers
 */
function sortProjectPaper(papers: Project_Paper[], sortOption: SortOption): Project_Paper[] {
    const { criterion, direction } = sortOption;

    const sorted = [...papers];

    sorted.sort((a, b) => {
        let compareResult = 0;

        switch (criterion) {
            case SortCriteria.PAPER_TITLE:
                compareResult = (a.paper?.title?.toLowerCase() ?? "").localeCompare(
                    b.paper?.title?.toLowerCase() ?? "",
                );
                break;

            case SortCriteria.YEAR:
                compareResult = (a.paper?.year ?? 0) - (b.paper?.year ?? 0);
                break;

            case SortCriteria.DECISION:
                compareResult = comparePaperDecisions(a.decision, b.decision);
                break;

            case SortCriteria.PAPER_ID:
                compareResult = a.localId.localeCompare(b.localId);
                break;
        }

        // Reverse result if descending
        return direction === SortDirection.DESC ? -compareResult : compareResult;
    });

    return sorted;
}
export { sortProjectPaper };
