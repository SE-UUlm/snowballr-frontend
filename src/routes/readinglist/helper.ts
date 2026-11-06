import { backendService } from "$lib/grpc-api";
import { Nothing } from "snowballr-api/base";
import type { Paper } from "snowballr-api/paper";

export async function loadReadingList(): Promise<Paper[]> {
    const loadingReadingList: Promise<Paper[]> = backendService
        .getReadingList(Nothing)
        .response.then((readingList) => readingList.papers)
        .catch(() => {
            throw new Error("Couldn't load reading list.");
        });

    return loadingReadingList;
}
