import { getReadingList } from "$lib/api/reading-list";
import type { Paper } from "$lib/api/types";

export async function loadReadingList(): Promise<Paper[]> {
    return getReadingList().catch((error: unknown) => {
        throw new Error("Couldn't load reading list.", { cause: error });
    });
}
