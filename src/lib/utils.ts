import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Author } from "./model/backend";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function displayAuthors(authors: Author[]) {
    return authors.map((author) => `${author.firstName} ${author.lastName}`).join(", ");
}
