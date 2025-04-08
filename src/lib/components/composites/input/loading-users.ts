import { backendService } from "$lib/grpc-api";
import { Nothing } from "$lib/model/api/base";
import type { User } from "$lib/model/api/user";

export async function loadUsers(thisUser: User, excludeUsers: User[] = []) {
    const excludeIds = excludeUsers.map((user) => user.id);
    excludeIds.push(thisUser.id);
    let initialPossibleMembers: User[] = [];
    let isErrorOnUsersLoading = false;
    try {
        const users = await backendService.getAllUsers(Nothing).response.then(({ users }) => users);
        initialPossibleMembers = users.filter((user) => !excludeIds.includes(user.id));
    } catch (error) {
        isErrorOnUsersLoading = true;
        console.error(`Couldn't load users (${error})`);
    }

    return {
        initialPossibleMembers,
        isErrorOnUsersLoading,
    };
}
