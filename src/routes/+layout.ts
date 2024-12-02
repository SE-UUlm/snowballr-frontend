import type { User } from "$lib/types";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async () => {
    const user: User = {
        firstName: "John",
        lastName: "Doe",
    };
    return {
        user,
    };
};
