import { type User, UserRole, UserStatus } from "$lib/model/api/user";
import type { LayoutLoad } from "./$types";
import { backendService } from "$lib/grpc-api";
import { Nothing } from "$lib/model/api/base";

export const load: LayoutLoad = async ({ depends }) => {
    depends("data:getCurrentUser");
    /// TODO: exchange this logic in !220 or !124 with better handling of the case, the user could not be loaded
    let user: User;
    try {
        user = await backendService.getCurrentUser(Nothing).response;
    } catch (err) {
        console.error(`Current user could not be loaded ${err}`);
        user = {
            id: "0",
            email: "john.doe@example.com",
            firstName: "John",
            lastName: "Doe",
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
        };
    }

    return {
        user,
    };
};
