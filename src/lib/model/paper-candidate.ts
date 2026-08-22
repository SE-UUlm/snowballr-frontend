import type { Paper } from "$api/paper";
import { backendService } from "$lib/grpc-api";
import { createActionError, type ActionError } from "$lib/model/action-error";
import { isGrpcError, pluralize } from "$lib/utils/common-helper";
import { GrpcStatusCode } from "@protobuf-ts/grpcweb-transport";
import type { RpcError } from "@protobuf-ts/runtime-rpc";
import { toast } from "svelte-sonner";

/** Shown when every requested source answered and none of them had anything to offer. */
export const NO_CANDIDATES_MESSAGE =
    "The search did not return any papers. Either the query didn't match any papers or all papers" +
    " that match the query already exist in this project";

/**
 * A paper offered to the user for adding to a project.
 *
 * A candidate is either **known** - it exists in the SnowballR database and therefore carries a real
 * paper id - or **new**, meaning a fetcher found it somewhere else and it has to be created before
 * it can be added.
 *
 * The distinction gets its own field on purpose. It used to be encoded in `paper.id`, which was
 * given the paper's index in the fetcher response when the paper had no id of its own. That single
 * string then had to serve as the render key, the deduplication key *and* the create-or-adopt
 * signal, and those meanings collided: local paper ids are small numeric strings, so a new fetcher
 * paper at index 1 was discarded whenever a local result happened to have id "1" (see #699).
 */
export interface PaperCandidate {
    /** The paper itself, exactly as the backend returned it. */
    paper: Paper;
    /**
     * Stable identity for rendering and selection.
     *
     * For known papers this is the paper id. New papers have no id yet, so they get a synthetic key
     * that cannot be mistaken for one. Never send this to the backend.
     */
    key: string;
    /** Whether the paper has to be created before it can be added to a project. */
    isNew: boolean;
}

/** Which sources a candidate search should consult. */
export interface PaperCandidateSources {
    /** Whether to search papers already in the SnowballR database. */
    includeLocal: boolean;
    /** Whether to search the project's configured fetchers. */
    includeFetchers: boolean;
}

/** The outcome of a candidate search. */
export interface PaperCandidateSearchResult {
    /** The deduplicated candidates, local ones first. */
    candidates: PaperCandidate[];
    /**
     * The failure of a source that could not be searched, if any.
     *
     * A failing source contributes no candidates instead of failing the whole search, so this can be
     * set while `candidates` still holds results from the other source.
     */
    error: ActionError;
}

/** Where a batch of candidates should be added. */
export interface PaperCandidateTarget {
    projectId: string;
    stage: bigint;
}

/** What became of a batch of candidates. */
export interface AddPaperCandidatesSummary {
    /** How many papers actually landed in the project. */
    added: number;
    /** The candidates that did not, and the step each one failed at. */
    failed: { candidate: PaperCandidate; step: "create" | "add" }[];
}

/**
 * Wraps papers that are already in the SnowballR database.
 *
 * @param papers - Papers returned by the local candidate search
 * @returns The papers as known candidates, keyed by their paper id
 */
export function toKnownCandidates(papers: Paper[]): PaperCandidate[] {
    return papers.map((paper) => ({ paper, key: paper.id, isNew: false }));
}

/**
 * Wraps papers returned by the fetchers.
 *
 * A fetcher reports an empty id for a paper the SnowballR database does not know yet. Those become
 * new candidates with a synthetic key; the rest are known papers like any other.
 *
 * @param papers - Papers returned by the fetcher candidate search
 * @returns The papers as candidates, new ones keyed synthetically
 */
export function toFetcherCandidates(papers: Paper[]): PaperCandidate[] {
    return papers.map((paper, index) =>
        paper.id === ""
            ? { paper, key: `new:${index}`, isNew: true }
            : { paper, key: paper.id, isNew: false },
    );
}

function externalIdKey(externalId: { type: string; value: string }): string {
    return JSON.stringify([externalId.type, externalId.value]);
}

/**
 * Merges fetcher candidates into the local ones, dropping those that are the same paper.
 *
 * Two candidates are the same paper when they share a real paper id, or when they share an external
 * id whose type *and* value are both non-empty. Blank external ids are ignored on both sides,
 * because "no DOI" is not evidence that two papers match.
 *
 * New candidates have no paper id, so they are only ever matched on external ids. This is what keeps
 * a fetcher paper's position in the response from deciding whether it is shown (#699).
 *
 * @param local - Candidates from the SnowballR database
 * @param fetched - Candidates from the fetchers
 * @returns The local candidates followed by the fetcher candidates that are not already among them
 */
export function mergePaperCandidates(
    local: PaperCandidate[],
    fetched: PaperCandidate[],
): PaperCandidate[] {
    const localIds = new Set(
        local.filter((it) => !it.isNew && it.paper.id !== "").map((it) => it.paper.id),
    );
    const localExternalIdKeys = new Set(
        local.flatMap((it) =>
            it.paper.externalIds
                .filter((externalId) => externalId.type !== "" && externalId.value !== "")
                .map(externalIdKey),
        ),
    );

    function isAlreadyLocal(candidate: PaperCandidate): boolean {
        if (!candidate.isNew && candidate.paper.id !== "" && localIds.has(candidate.paper.id)) {
            return true;
        }

        return candidate.paper.externalIds.some(
            (externalId) =>
                externalId.type !== "" &&
                externalId.value !== "" &&
                localExternalIdKeys.has(externalIdKey(externalId)),
        );
    }

    return [...local, ...fetched.filter((it) => !isAlreadyLocal(it))];
}

async function searchSource(
    search: () => Promise<Paper[]>,
    sourceName: string,
): Promise<{ papers: Paper[]; error: ActionError }> {
    try {
        return { papers: await search(), error: undefined };
    } catch (error) {
        return {
            papers: [],
            error: createActionError(
                `Failed to search for ${sourceName} papers`,
                { action: `searching for ${sourceName} papers` },
                error as Error,
            ),
        };
    }
}

/**
 * Searches both candidate sources and merges what they return.
 *
 * The sources are searched concurrently and independently: if one fails it contributes nothing and
 * its failure is reported, while the other's results are still offered. A source that was not
 * requested is simply not searched.
 *
 * An empty result gets a toast explaining it, since an empty list on its own does not distinguish
 * "nothing matched" from "everything already added". That explanation is only offered when every
 * requested source answered, because a failing source empties the result for an entirely different
 * reason and the caller already reports that one (see #702).
 *
 * @param query - The user's search query
 * @param projectId - The project the papers would be added to
 * @param sources - Which sources to consult
 * @returns The merged candidates and the failure of a source that could not be searched
 */
export async function searchPaperCandidates(
    query: string,
    projectId: string,
    sources: PaperCandidateSources,
): Promise<PaperCandidateSearchResult> {
    const [localResult, fetcherResult] = await Promise.all([
        sources.includeLocal
            ? searchSource(
                  () =>
                      backendService
                          .searchLocalProjectPaperCandidates({ query, projectId })
                          .response.then((it) => it.papers),
                  "local",
              )
            : { papers: [], error: undefined },
        sources.includeFetchers
            ? searchSource(
                  () =>
                      backendService
                          .searchFetcherProjectPaperCandidates({ query, projectId })
                          .response.then((it) => it.papers),
                  "fetcher",
              )
            : { papers: [], error: undefined },
    ]);

    const candidates = mergePaperCandidates(
        toKnownCandidates(localResult.papers),
        toFetcherCandidates(fetcherResult.papers),
    );

    const error = localResult.error ?? fetcherResult.error;

    if (candidates.length === 0 && error === undefined) {
        toast.info(NO_CANDIDATES_MESSAGE);
    }

    return { candidates, error };
}

/**
 * Makes sure a candidate's paper exists in the SnowballR database.
 *
 * Known papers are adopted as they are. New ones are created, and an `ALREADY_EXISTS` response
 * counts as success: another user may have created the same paper between the search and this call,
 * and in that case the paper is exactly what we wanted anyway.
 *
 * @param candidate - The candidate whose paper should exist afterwards
 * @returns The stored paper, or `undefined` if it could not be created
 */
async function resolvePaper(candidate: PaperCandidate): Promise<Paper | undefined> {
    if (!candidate.isNew) {
        return candidate.paper;
    }

    try {
        return await backendService.createPaper(candidate.paper).response;
    } catch (error) {
        if (isGrpcError((error as RpcError).code, GrpcStatusCode.ALREADY_EXISTS)) {
            return candidate.paper;
        }

        return undefined;
    }
}

/**
 * Adds a batch of candidates to a project stage.
 *
 * Papers are handled one at a time and a failure does not abandon the rest of the batch: each one
 * that fails is toasted individually and the run continues. The closing success toast counts only
 * the papers that actually landed, and is skipped entirely when none did.
 *
 * @param candidates - The candidates to add, in the order the user selected them
 * @param target - The project and stage to add them to
 * @returns How many papers were added and which candidates failed
 */
export async function addPaperCandidates(
    candidates: PaperCandidate[],
    target: PaperCandidateTarget,
): Promise<AddPaperCandidatesSummary> {
    const summary: AddPaperCandidatesSummary = { added: 0, failed: [] };

    for (const candidate of candidates) {
        const paper = await resolvePaper(candidate);

        if (paper === undefined) {
            toast.error(`Paper '${candidate.paper.title}' could not be created.`);
            summary.failed.push({ candidate, step: "create" });
            continue;
        }

        try {
            await backendService.addPaperToProject({
                paperId: paper.id,
                projectId: target.projectId,
                stage: target.stage,
            }).response;
        } catch {
            toast.error(`Paper '${candidate.paper.title}' could not be added.`);
            summary.failed.push({ candidate, step: "add" });
            continue;
        }

        summary.added++;
    }

    if (summary.added > 0) {
        toast.success(
            `Successfully added ${summary.added} ${pluralize(summary.added, "paper", "papers")} to the project.`,
        );
    }

    return summary;
}
