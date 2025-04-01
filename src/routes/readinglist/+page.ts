import type { PageLoad } from "./$types";
import type { ReadingListEntryInterface } from "$lib/model/component-interfaces";
import { backendService } from "$lib/grpc-api";

export const load: PageLoad = () => {
    const loadingReadingList: Promise<ReadingListEntryInterface[]> = backendService
        .getReadingList({})
        .response.then((readingList) => readingList.papers.map((paper) => ({ paper: paper })))
        .catch(() => {
            throw new Error("Couldn't load reading list.");
        });

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    loadingReadingList.catch(() => {});

    return {
        loadingReadingList,
    };
};
