import { User } from "$lib/model/api/user";
import { getContext, setContext } from "svelte";

export type UserContext = () => User;
/**
 * Key for context storing a user.
 */
export const USER_KEY = Symbol("userContext");
export function setUserContext(user: UserContext) {
    setContext(USER_KEY, user);
}
export function getUserContext(): User {
    return (getContext(USER_KEY) as UserContext)();
}
