import type { PaperListEntryInterface } from "$lib/model/general";
import { backendService } from "$lib/grpc-api";
import type { PageLoad } from "./$types";

/**
 * Loads open reviews for the currently opened project.
 */
export const load: PageLoad = async ({ params }) => {
    const openReviews: Promise<PaperListEntryInterface[]> = backendService
        .getPapersToReviewForProject({
            id: params.projectId,
        })
        .response.then((allUndecidedPapers) =>
            allUndecidedPapers.projectPapers.map((projectPaper) => ({
                projectId: params.projectId,
                paper: projectPaper,
                showReviewStatus: false,
            })),
        )
        .catch(() => {
            throw new Error("Could not load open reviews.");
        });

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    openReviews.catch(() => {});

    return { openReviews };
};
