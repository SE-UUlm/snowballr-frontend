import type { PageLoad } from "./$types";
import { backendService } from "$lib/grpc-api";
import type { Paper } from "$lib/model/api/paper";

export const load: PageLoad = () => {
    const loadingReadingList: Promise<Paper[]> = backendService
        .getReadingList({})
        .response.then((readingList) => readingList.papers)
        .catch(() => {
            throw new Error("Couldn't load reading list.");
        });

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    loadingReadingList.catch(() => {});

    return {
        loadingReadingList,
    };
};
