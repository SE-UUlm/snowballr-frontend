import type { User } from "$lib/model/backend";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async () => {
    const user: User = {
        id: 0,
        status: "active",
        firstName: "John",
        lastName: "Doe",
        isAdmin: false,
        email: "john.doe@example.com",
    };
    return {
        user,
    };
};
