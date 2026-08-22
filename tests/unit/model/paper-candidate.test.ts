import { beforeEach, describe, expect, test, vi, type Mock } from "vitest";
import { Paper } from "$api/paper";
import { Project_Paper } from "$api/project";
import {
    addPaperCandidates,
    mergePaperCandidates,
    NO_CANDIDATES_MESSAGE,
    searchPaperCandidates,
    toFetcherCandidates,
    toKnownCandidates,
    type PaperCandidate,
} from "$lib/model/paper-candidate";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { backendService } from "$lib/grpc-api";
import type { ISnowballRClient } from "$api/main.client";
import { GrpcStatusCode } from "@protobuf-ts/grpcweb-transport";
import { toast } from "svelte-sonner";

vi.mock("svelte-sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), promise: vi.fn() },
}));

const PROJECT_ID = "project-1";
const TARGET = { projectId: PROJECT_ID, stage: 3n };

/** A paper as the local search returns it: always carrying a real, database-assigned id. */
function localPaper(id: string, overrides: Partial<Paper> = {}): Paper {
    return Paper.create({ id, title: `Local ${id}`, ...overrides });
}

/** A paper as a fetcher returns it when SnowballR does not know it yet: no id at all. */
function newPaper(title: string, overrides: Partial<Paper> = {}): Paper {
    return Paper.create({ id: "", title, ...overrides });
}

function doi(value: string) {
    return { type: "DOI", displayType: "DOI", value };
}

/**
 * Mocks an API call to reject with a specific error object.
 *
 * `mockFailedApiCall` rejects with a plain `Error`, which carries no gRPC status code, so it cannot
 * express an `ALREADY_EXISTS` response.
 */
function mockRejectedApiCall<T extends keyof ISnowballRClient>(methodName: T, error: unknown) {
    return (backendService[methodName] as Mock)
        .mockClear()
        .mockImplementation(() => ({ response: Promise.reject(error) }));
}

function rpcError(code: string, message = "rpc failed") {
    return Object.assign(new Error(message), { code });
}

beforeEach(() => {
    vi.clearAllMocks();
    mockApiCall("searchLocalProjectPaperCandidates", { papers: [] });
    mockApiCall("searchFetcherProjectPaperCandidates", { papers: [] });
    mockApiCall("createPaper", Paper.create({ id: "created-1" }));
    mockApiCall("addPaperToProject", Project_Paper.create());
});

describe("toKnownCandidates", () => {
    test("When a local paper is wrapped, then it is keyed by its paper id", () => {
        expect(toKnownCandidates([localPaper("7")])).toEqual([
            { paper: localPaper("7"), key: "7", isNew: false },
        ]);
    });

    test("When a local paper is wrapped, then it never needs to be created", () => {
        const candidates = toKnownCandidates([localPaper("0"), localPaper("1")]);

        expect(candidates.every((it) => !it.isNew)).toBe(true);
    });
});

describe("toFetcherCandidates", () => {
    test("When a fetcher paper is already in the database, then it is keyed by its paper id", () => {
        expect(toFetcherCandidates([localPaper("7")])).toEqual([
            { paper: localPaper("7"), key: "7", isNew: false },
        ]);
    });

    test("When a fetcher paper is unknown, then it is marked as new", () => {
        const [candidate] = toFetcherCandidates([newPaper("Fresh")]);

        expect(candidate.isNew).toBe(true);
    });

    test("When fetcher papers are unknown, then their keys cannot be mistaken for paper ids", () => {
        const candidates = toFetcherCandidates([newPaper("A"), newPaper("B")]);

        expect(candidates.map((it) => it.key)).toEqual(["new:0", "new:1"]);
        expect(candidates.every((it) => Number.isNaN(Number(it.key)))).toBe(true);
    });

    test("When fetcher papers are unknown, then each still gets a distinct key", () => {
        const candidates = toFetcherCandidates([newPaper("A"), newPaper("B"), newPaper("C")]);

        expect(new Set(candidates.map((it) => it.key)).size).toBe(3);
    });
});

describe("mergePaperCandidates", () => {
    function merge(local: Paper[], fetched: Paper[]): string[] {
        return mergePaperCandidates(toKnownCandidates(local), toFetcherCandidates(fetched)).map(
            (it) => it.paper.title,
        );
    }

    test("When a fetcher paper shares a paper id with a local one, then it is dropped", () => {
        expect(merge([localPaper("1")], [Paper.create({ id: "1", title: "Fetched" })])).toEqual([
            "Local 1",
        ]);
    });

    test("When a fetcher paper shares a non-empty external id with a local one, then it is dropped", () => {
        const local = localPaper("1", { externalIds: [doi("10.1/abc")] });
        const fetched = newPaper("Fetched", { externalIds: [doi("10.1/abc")] });

        expect(merge([local], [fetched])).toEqual(["Local 1"]);
    });

    test("When both papers only carry a blank external id, then both are kept", () => {
        const blank = { type: "", displayType: "", value: "" };
        const local = localPaper("1", { externalIds: [blank] });
        const fetched = newPaper("Fetched", { externalIds: [blank] });

        expect(merge([local], [fetched])).toEqual(["Local 1", "Fetched"]);
    });

    test("When an external id matches in type but its value is blank, then the paper is kept", () => {
        const local = localPaper("1", { externalIds: [{ ...doi(""), value: "" }] });
        const fetched = newPaper("Fetched", { externalIds: [{ ...doi(""), value: "" }] });

        expect(merge([local], [fetched])).toEqual(["Local 1", "Fetched"]);
    });

    test("When a fetcher paper matches nothing local, then it is kept after the local ones", () => {
        expect(merge([localPaper("1")], [newPaper("Fetched")])).toEqual(["Local 1", "Fetched"]);
    });

    test("When there are no local papers, then every fetcher paper is kept", () => {
        expect(merge([], [newPaper("A"), newPaper("B")])).toEqual(["A", "B"]);
    });

    // Regression guard for #699. A new fetcher paper has no paper id, so its position in the fetcher
    // response must not be able to collide with a local paper's id.
    test("When a new fetcher paper sits at the index of a local paper's id, then it is still kept", () => {
        const local = [localPaper("0"), localPaper("1")];
        const fetched = [newPaper("Fresh at index 0"), newPaper("Fresh at index 1")];

        expect(merge(local, fetched)).toEqual([
            "Local 0",
            "Local 1",
            "Fresh at index 0",
            "Fresh at index 1",
        ]);
    });
});

describe("searchPaperCandidates", () => {
    test("When only the local source is requested, then the fetchers are not searched", async () => {
        await searchPaperCandidates("query", PROJECT_ID, {
            includeLocal: true,
            includeFetchers: false,
        });

        expect(backendService.searchLocalProjectPaperCandidates).toHaveBeenCalledWith({
            query: "query",
            projectId: PROJECT_ID,
        });
        expect(backendService.searchFetcherProjectPaperCandidates).not.toHaveBeenCalled();
    });

    test("When only the fetcher source is requested, then the local database is not searched", async () => {
        await searchPaperCandidates("query", PROJECT_ID, {
            includeLocal: false,
            includeFetchers: true,
        });

        expect(backendService.searchFetcherProjectPaperCandidates).toHaveBeenCalled();
        expect(backendService.searchLocalProjectPaperCandidates).not.toHaveBeenCalled();
    });

    test("When both sources return papers, then they are merged", async () => {
        mockApiCall("searchLocalProjectPaperCandidates", { papers: [localPaper("1")] });
        mockApiCall("searchFetcherProjectPaperCandidates", { papers: [newPaper("Fetched")] });

        const result = await searchPaperCandidates("query", PROJECT_ID, {
            includeLocal: true,
            includeFetchers: true,
        });

        expect(result.candidates.map((it) => it.paper.title)).toEqual(["Local 1", "Fetched"]);
        expect(result.error).toBeUndefined();
    });

    test("When the local search fails, then the fetcher results are still offered", async () => {
        mockFailedApiCall("searchLocalProjectPaperCandidates", "boom");
        mockApiCall("searchFetcherProjectPaperCandidates", { papers: [newPaper("Fetched")] });

        const result = await searchPaperCandidates("query", PROJECT_ID, {
            includeLocal: true,
            includeFetchers: true,
        });

        expect(result.candidates.map((it) => it.paper.title)).toEqual(["Fetched"]);
        expect(result.error?.errorTitle).toBe("Failed to search for local papers");
    });

    test("When the fetcher search fails, then the local results are still offered", async () => {
        mockApiCall("searchLocalProjectPaperCandidates", { papers: [localPaper("1")] });
        mockFailedApiCall("searchFetcherProjectPaperCandidates", "boom");

        const result = await searchPaperCandidates("query", PROJECT_ID, {
            includeLocal: true,
            includeFetchers: true,
        });

        expect(result.candidates.map((it) => it.paper.title)).toEqual(["Local 1"]);
        expect(result.error?.errorTitle).toBe("Failed to search for fetcher papers");
    });

    test("When both sources fail, then an error is reported and nothing is offered", async () => {
        mockFailedApiCall("searchLocalProjectPaperCandidates", "boom");
        mockFailedApiCall("searchFetcherProjectPaperCandidates", "boom");

        const result = await searchPaperCandidates("query", PROJECT_ID, {
            includeLocal: true,
            includeFetchers: true,
        });

        expect(result.candidates).toEqual([]);
        expect(result.error).toBeDefined();
    });

    test("When the search returns nothing, then the user is told why the list is empty", async () => {
        await searchPaperCandidates("query", PROJECT_ID, {
            includeLocal: true,
            includeFetchers: true,
        });

        expect(toast.info).toHaveBeenCalledWith(NO_CANDIDATES_MESSAGE);
    });

    test("When the search returns papers, then no empty-result message is shown", async () => {
        mockApiCall("searchLocalProjectPaperCandidates", { papers: [localPaper("1")] });

        const result = await searchPaperCandidates("query", PROJECT_ID, {
            includeLocal: true,
            includeFetchers: false,
        });

        expect(result.candidates).toHaveLength(1);
        expect(toast.info).not.toHaveBeenCalled();
    });
});

describe("addPaperCandidates", () => {
    const known: PaperCandidate = { paper: localPaper("42"), key: "42", isNew: false };
    const fresh: PaperCandidate = { paper: newPaper("Fresh"), key: "new:0", isNew: true };

    test("When a candidate is already in the database, then it is not created again", async () => {
        const summary = await addPaperCandidates([known], TARGET);

        expect(backendService.createPaper).not.toHaveBeenCalled();
        expect(summary).toEqual({ added: 1, failed: [] });
    });

    test("When a candidate is added, then it lands in the requested project and stage", async () => {
        await addPaperCandidates([known], TARGET);

        expect(backendService.addPaperToProject).toHaveBeenCalledWith({
            paperId: "42",
            projectId: PROJECT_ID,
            stage: 3n,
        });
    });

    test("When a candidate is new, then it is created before being added", async () => {
        mockApiCall("createPaper", Paper.create({ id: "created-1", title: "Fresh" }));

        const summary = await addPaperCandidates([fresh], TARGET);

        expect(backendService.createPaper).toHaveBeenCalledWith(fresh.paper);
        expect(backendService.addPaperToProject).toHaveBeenCalledWith({
            paperId: "created-1",
            projectId: PROJECT_ID,
            stage: 3n,
        });
        expect(summary.added).toBe(1);
    });

    // Another user may create the same paper between the search and the add, so a paper that already
    // exists is what we wanted, not a failure.
    test("When creating a paper reports that it already exists, then it counts as success", async () => {
        mockRejectedApiCall("createPaper", rpcError(GrpcStatusCode[GrpcStatusCode.ALREADY_EXISTS]));

        const summary = await addPaperCandidates([fresh], TARGET);

        expect(summary).toEqual({ added: 1, failed: [] });
        expect(backendService.addPaperToProject).toHaveBeenCalled();
    });

    test("When creating a paper fails for another reason, then it is reported as a create failure", async () => {
        mockRejectedApiCall("createPaper", rpcError(GrpcStatusCode[GrpcStatusCode.INTERNAL]));

        const summary = await addPaperCandidates([fresh], TARGET);

        expect(summary).toEqual({ added: 0, failed: [{ candidate: fresh, step: "create" }] });
        expect(backendService.addPaperToProject).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith("Paper 'Fresh' could not be created.");
    });

    test("When adding a paper fails, then it is reported as an add failure", async () => {
        mockFailedApiCall("addPaperToProject", "boom");

        const summary = await addPaperCandidates([known], TARGET);

        expect(summary).toEqual({ added: 0, failed: [{ candidate: known, step: "add" }] });
        expect(toast.error).toHaveBeenCalledWith("Paper 'Local 42' could not be added.");
    });

    test("When one candidate fails, then the rest of the batch is still added", async () => {
        const first: PaperCandidate = { paper: localPaper("1"), key: "1", isNew: false };
        const second: PaperCandidate = { paper: localPaper("2"), key: "2", isNew: false };
        const third: PaperCandidate = { paper: localPaper("3"), key: "3", isNew: false };
        (backendService.addPaperToProject as Mock)
            .mockClear()
            .mockImplementation(({ paperId }) =>
                paperId === "2"
                    ? { response: Promise.reject(new Error("boom")) }
                    : { response: Promise.resolve({}) },
            );

        const summary = await addPaperCandidates([first, second, third], TARGET);

        expect(summary.added).toBe(2);
        expect(summary.failed).toEqual([{ candidate: second, step: "add" }]);
    });

    test("When only some candidates land, then the success message counts those", async () => {
        const first: PaperCandidate = { paper: localPaper("1"), key: "1", isNew: false };
        const second: PaperCandidate = { paper: localPaper("2"), key: "2", isNew: false };
        (backendService.addPaperToProject as Mock)
            .mockClear()
            .mockImplementation(({ paperId }) =>
                paperId === "2"
                    ? { response: Promise.reject(new Error("boom")) }
                    : { response: Promise.resolve({}) },
            );

        await addPaperCandidates([first, second], TARGET);

        expect(toast.success).toHaveBeenCalledWith("Successfully added 1 paper to the project.");
    });

    test("When several candidates land, then the success message is pluralized", async () => {
        const first: PaperCandidate = { paper: localPaper("1"), key: "1", isNew: false };
        const second: PaperCandidate = { paper: localPaper("2"), key: "2", isNew: false };

        await addPaperCandidates([first, second], TARGET);

        expect(toast.success).toHaveBeenCalledWith("Successfully added 2 papers to the project.");
    });

    test("When no candidate lands, then no success message is shown", async () => {
        mockFailedApiCall("addPaperToProject", "boom");

        await addPaperCandidates([known], TARGET);

        expect(toast.success).not.toHaveBeenCalled();
    });

    test("When there is nothing to add, then no request is made", async () => {
        const summary = await addPaperCandidates([], TARGET);

        expect(summary).toEqual({ added: 0, failed: [] });
        expect(backendService.addPaperToProject).not.toHaveBeenCalled();
        expect(toast.success).not.toHaveBeenCalled();
    });
});
