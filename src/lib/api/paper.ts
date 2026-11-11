import type { PartialMessage } from "@protobuf-ts/runtime";
import { Paper } from "snowballr-api/paper";
import { client } from "./client";
import { buildFieldMask } from "./fieldmask";
import { call } from "./grpc";

/**
 * A sparse patch of the details of a paper that users edit: only the fields to change.
 *
 * **Write it as a plain object.** Don't build it with `Paper.create()` or any other generated
 * `create()`: they fill in every field, so the mask derived from the patch would cover all other
 * fields and reset them to their defaults.
 */
export type PaperDetailsPatch = PartialMessage<
    Pick<
        Paper,
        | "externalIds"
        | "title"
        | "abstrakt"
        | "year"
        | "publisher"
        | "publicationName"
        | "publicationType"
        | "authors"
    >
>;

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

/**
 * Creates a paper. Fields left out get their defaults, and the backend assigns the ID.
 *
 * Rejects with kind `"already-exists"` if the paper, or one too similar to it, already exists.
 *
 * @param paper - The paper to create
 * @returns The created paper
 */
export async function createPaper(paper: PartialMessage<Paper>): Promise<Paper> {
    return call(client.createPaper(Paper.create(paper)));
}

/**
 * Updates the details of a paper that `patch` names and leaves all other fields as they are.
 *
 * @param paperId - The ID of the paper
 * @param patch - The details to change
 * @returns The updated paper
 */
export async function updatePaperDetails(
    paperId: string,
    patch: PaperDetailsPatch,
): Promise<Paper> {
    // The mask is derived from the plain patch, so it names exactly the changed fields. Only then
    // the patch becomes a Paper message, because create() fills in every field. The ID identifies
    // the paper and stays out of the mask.
    const sparsePatch: PartialMessage<Paper> = { id: paperId, ...patch };
    return call(
        client.updatePaper({
            paper: Paper.create(sparsePatch),
            mask: buildFieldMask(sparsePatch, "paper"),
        }),
    );
}

/**
 * Creates a paper with every field at its default, without a backend call. It stands in for a
 * paper that doesn't exist yet, for example in the form for a new paper.
 *
 * @returns The empty paper
 */
export function emptyPaper(): Paper {
    return Paper.create();
}
