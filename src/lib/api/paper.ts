import type { Paper } from "snowballr-api/paper";
import { client } from "./client";
import { call } from "./grpc";

/**
 * Loads a paper.
 *
 * @param paperId - The ID of the paper
 * @returns The paper
 */
export async function getPaper(paperId: string): Promise<Paper> {
    return call(client.getPaperById({ id: paperId }));
}

/**
 * Loads the papers that a paper references, i.e. its references.
 *
 * @param paperId - The ID of the paper
 * @returns The referenced papers, possibly none
 */
export async function getBackwardReferencedPapers(paperId: string): Promise<Paper[]> {
    const { papers } = await call(client.getBackwardReferencedPapers({ id: paperId }));
    return papers;
}

/**
 * Loads the papers that reference a paper, i.e. the papers that cite it.
 *
 * @param paperId - The ID of the paper
 * @returns The citing papers, possibly none
 */
export async function getForwardReferencedPapers(paperId: string): Promise<Paper[]> {
    const { papers } = await call(client.getForwardReferencedPapers({ id: paperId }));
    return papers;
}
