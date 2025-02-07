import { type User, UserRole, UserStatus } from "$lib/model/api/user";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async () => {
    const user: User = {
        id: "0",
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
    };
    return {
        user,
    };
};
