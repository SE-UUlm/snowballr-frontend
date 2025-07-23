import type { User } from "$lib/model/api/user";

export type UserContext = () => User;

export const UserContextKey = Symbol("userContext");
