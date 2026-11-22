import type { PageLoad } from "./$types";
import { loadReadingList } from "#lib/utils/reading-list-helper.js";

export const load: PageLoad = () => {
    return { loadingReadingList: loadReadingList() };
};
