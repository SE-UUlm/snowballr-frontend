import { redirect } from "@sveltejs/kit";
import { getStageFromSearchParams } from "$lib/utils/search-parameters";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params, url }) => {
    const stage = getStageFromSearchParams(url.searchParams);

    // The "Add New Paper" button always names the stage it was clicked in, so a URL without a usable
    // one was hand-edited or has gone stale. It cannot say where the paper belongs, and picking a
    // stage on the user's behalf files their paper somewhere they never chose, so send them back to
    // the list where every stage offers its own button.
    if (stage === undefined) {
        redirect(303, `/project/${params.projectId}/papers`);
    }

    return {
        creationTarget: { projectId: params.projectId, stage },
    };
};
