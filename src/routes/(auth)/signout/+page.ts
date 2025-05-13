import type { PageLoad } from "./$types";
import { backendService } from "$lib/grpc-api";
import { goto } from "$app/navigation";

export const load: PageLoad = async () => {
    await backendService.logout({});
    goto("/signin");
};
