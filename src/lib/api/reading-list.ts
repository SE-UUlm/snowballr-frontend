import { Nothing } from "snowballr-api/base";
import type { Paper } from "snowballr-api/paper";
import { client } from "./client";
import { call } from "./grpc";

/**
 * Loads the papers on the current user's reading list.
 *
 * @returns The papers on the reading list
 */
export async function getReadingList(): Promise<Paper[]> {
    const { papers } = await call(client.getReadingList(Nothing));
    return papers;
}

/**
 * Checks whether a paper is on the current user's reading list.
 *
 * @param paperId - The ID of the paper
 * @returns True if the paper is on the reading list
 */
export async function isPaperOnReadingList(paperId: string): Promise<boolean> {
    const { value } = await call(client.isPaperOnReadingList({ id: paperId }));
    return value;
}

/**
 * Adds a paper to the current user's reading list.
 *
 * @param paperId - The ID of the paper
 */
export async function addPaperToReadingList(paperId: string): Promise<void> {
    await call(client.addPaperToReadingList({ id: paperId }));
}

/**
 * Removes a paper from the current user's reading list.
 *
 * @param paperId - The ID of the paper
 */
export async function removePaperFromReadingList(paperId: string): Promise<void> {
    await call(client.removePaperFromReadingList({ id: paperId }));
}
