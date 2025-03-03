import { type User } from "$lib/model/api/user";
import type { LayoutLoad } from "./$types";
import { backendService } from "$lib/grpc-api";
import { Nothing } from "$lib/model/api/base";
import { error } from "@sveltejs/kit";

export const load: LayoutLoad = async () => {
    try {
        const user: User = await backendService.getCurrentUser(Nothing).response;
        return {
            user,
        };
    } catch (err) {
        console.error(`Current user could not be loaded ${err}`);
        /// TODO: find better code
        error(500, "Could not load current user!");
    }
};
