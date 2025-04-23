import type { PageLoad } from "./$types";
import { loadReadingList } from "./helper";

export const load: PageLoad = () => {
    return { loadingReadingList: loadReadingList() };
};
