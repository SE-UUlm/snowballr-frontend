import { getReadingList } from "#lib/api/reading-list.js";
import type { Paper } from "#lib/api/types.js";

export async function loadReadingList(): Promise<Paper[]> {
    return getReadingList().catch((error: unknown) => {
        throw new Error("Couldn't load reading list.", { cause: error });
    });
}
