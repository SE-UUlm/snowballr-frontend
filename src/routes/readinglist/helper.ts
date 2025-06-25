import { backendService } from "$lib/grpc-api";
import { Nothing } from "$lib/model/api/base";
import type { Paper } from "$lib/model/api/paper";

export async function loadReadingList(): Promise<Paper[]> {
    const loadingReadingList: Promise<Paper[]> = backendService
        .getReadingList(Nothing)
        .response.then((readingList) => readingList.papers)
        .catch(() => {
            throw new Error("Couldn't load reading list.");
        });

    return loadingReadingList;
}
