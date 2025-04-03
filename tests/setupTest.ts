/* Test setup file, inspired by https://github.com/wd-David/svelte-component-test-recipes?tab=readme-ov-file#setuptestts */
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect, vi, type Mock } from "vitest";
import type { Navigation, Page } from "@sveltejs/kit";
import { readable } from "svelte/store";
import * as environment from "$app/environment";
import * as navigation from "$app/navigation";
import * as stores from "$app/stores";
import {
    createCriterion,
    createPaper,
    createProject,
    createProjectPaper,
    createReview,
    createUser,
} from "./model-builder";
import { Criteria, Members, Papers, ProjectPapers, Projects, Reviews, Users } from "./example-data";
import type { ISnowballRClient } from "$lib/model/api/main.client";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import { PaperDecision } from "$lib/model/api/project";

// Add custom jest matchers
expect.extend(matchers);

// Mock SvelteKit runtime module $app/environment
vi.mock("$app/environment", (): typeof environment => ({
    browser: false,
    dev: true,
    building: false,
    version: "any",
}));

// Mock SvelteKit runtime module $app/navigation
vi.mock("$app/navigation", (): typeof navigation => ({
    afterNavigate: () => {},
    beforeNavigate: () => {},
    disableScrollHandling: () => {},
    goto: () => Promise.resolve(),
    invalidate: () => Promise.resolve(),
    invalidateAll: () => Promise.resolve(),
    preloadData: () => Promise.resolve({ type: "loaded", status: 200, data: {} }),
    preloadCode: () => Promise.resolve(),
    onNavigate: () => {},
    pushState: () => {},
    replaceState: () => {},
}));

// Mock SvelteKit runtime module $app/stores
vi.mock("$app/stores", (): typeof stores => {
    const getStores: typeof stores.getStores = () => {
        const navigating = readable<Navigation | null>(null);
        const page = readable<Page>({
            url: new URL("http://localhost"),
            params: {},
            route: {
                id: null,
            },
            status: 200,
            error: null,
            data: {},
            state: {},
            form: undefined,
        });

        const updated = { subscribe: readable(false).subscribe, check: async () => false };

        return { navigating, page, updated };
    };

    const page: typeof stores.page = {
        subscribe(fn) {
            return getStores().page.subscribe(fn);
        },
    };
    const navigating: typeof stores.navigating = {
        subscribe(fn) {
            return getStores().navigating.subscribe(fn);
        },
    };
    const updated: typeof stores.updated = {
        subscribe(fn) {
            return getStores().updated.subscribe(fn);
        },
        check: async () => false,
    };

    return {
        getStores,
        navigating,
        page,
        updated,
    };
});

// This type takes the SnowballRClient interface and returns a new "interface" type where each api function returns a MockUnaryCall, i.e. a mocked API call, instead of a normal UnaryCall.
type MockReturnType<T> = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [K in keyof T]: T[K] extends (...args: infer A) => UnaryCall<infer _I, infer R>
        ? Mock<(...args: A) => MockUnaryCall<R>>
        : T[K];
};
type MockApi = MockReturnType<ISnowballRClient>;
interface MockUnaryCall<T> {
    response: Promise<T>;
}

/**
 * Mocks a backend API call
 *
 * Usage:
 * ```ts
 * getUserById: mock(({ id }) => createUser({ id })),
 * getAllUsers: mock(Object.values(Users)),
 * ```
 *
 * @param fn - Either a function that takes an argument and returns a value or a constant value that is returned
 * @returns A mocked backend API call
 */
function mock<T, R>(fn: ((arg: T) => R) | R): Mock<(input: T) => MockUnaryCall<R>> {
    return vi.fn((input: T) => {
        if (typeof fn === "function") {
            return {
                response: Promise.resolve((fn as (arg: T) => R)(input)),
            };
        } else {
            return {
                response: Promise.resolve(fn),
            };
        }
    });
}

// Mock Backend API
// Here we mock the backend API calls that are used in the application for the integration tests.
// Note: This is only a base mock, you can/should override this mock in your tests according to your needs.
// For example, you can mock the backend API to return an error, or to return a specific response.
// It is not necessary to mock all the API calls, only the ones that are used in the test.
vi.mock("$lib/grpc-api", () => {
    const mockBackend: { backendService: MockApi } = {
        backendService: {
            getAvailableFetcherApis: mock({
                fetcherApis: ["Google Scholar", "IEEE Xplore", "SpringerLink"],
            }),
            register: vi.fn(),
            login: vi.fn(),
            logout: vi.fn(),
            isAuthenticated: mock({ value: true }),
            renewSession: vi.fn(),
            requestPasswordReset: vi.fn(),
            resetPassword: vi.fn(),
            changePassword: vi.fn(),
            getAllUsers: mock({ users: Object.values(Users) }),
            getCurrentUser: mock(Users.johnDoe),
            getUserById: mock(({ id }) => createUser({ id })),
            getUserByEmail: mock(({ id: email }) => createUser({ email: email })),
            updateUser: vi.fn(),
            softDeleteUser: vi.fn(),
            softUndeleteUser: vi.fn(),
            getAllPapersToReview: mock({
                projectPapers: Object.values(ProjectPapers).filter(
                    (paper) => paper.decision === PaperDecision.UNDECIDED,
                ),
            }),
            getPapersToReviewForProject: mock({
                projectPapers: Object.values(ProjectPapers).filter(
                    (paper) => paper.decision === PaperDecision.UNDECIDED,
                ),
            }),
            getUserSettings: vi.fn(),
            updateUserSettings: vi.fn(),
            getReadingList: mock({ papers: Object.values(Papers) }),
            isPaperOnReadingList: vi.fn(),
            addPaperToReadingList: vi.fn(),
            removePaperFromReadingList: vi.fn(),
            getPendingInvitationsForUser: mock({ projects: [Object.values(Projects).at(0)!] }),
            inviteUserToProject: vi.fn(),
            getPendingInvitationsForProject: mock({ users: [Object.values(Users).at(0)!] }),
            getProjectMembers: mock({ members: Object.values(Members) }),
            removeProjectMember: vi.fn(),
            getAllProjects: mock({ projects: Object.values(Projects) }),
            getAllDeletedProjects: mock({ projects: [] }),
            getAllDeletedProjectsForUser: mock({ projects: [] }),
            getAllArchivedProjects: mock({ projects: [Object.values(Projects).at(-1)!] }),
            getAllProjectsForUser: mock({ projects: Object.values(Projects) }),
            getAllArchivedProjectsForUser: mock({ projects: [Object.values(Projects).at(-1)!] }),
            createProject: vi.fn(),
            getProjectById: mock(({ id }) => createProject({ id })),
            updateProject: vi.fn(),
            exportProject: vi.fn(),
            softDeleteProject: vi.fn(),
            softUndeleteProject: vi.fn(),
            getProjectStatistics: vi.fn(),
            getCriterionById: mock(({ id }) => createCriterion({ id })),
            getAllCriteriaForProject: mock({ criteria: Object.values(Criteria) }),
            createCriterion: vi.fn(),
            updateCriterion: vi.fn(),
            deleteCriterion: vi.fn(),
            getProjectPaperById: mock(({ id }) => createProjectPaper({ id })),
            getAllProjectPapersForProject: mock({ projectPapers: Object.values(ProjectPapers) }),
            addPaperToProject: vi.fn(),
            updateProjectPaper: vi.fn(),
            removePaperFromProject: vi.fn(),
            getReviewById: mock(({ id }) => createReview({ id })),
            getAllReviewsForProjectPaper: mock({ reviews: Object.values(Reviews) }),
            createReview: vi.fn(),
            updateReview: vi.fn(),
            deleteReview: vi.fn(),
            getPaperById: mock(({ id }) => createPaper({ id })),
            createPaper: vi.fn(),
            updatePaper: vi.fn(),
            getForwardReferencedPapers: mock({ papers: Object.values(Papers).slice(0, 3) }),
            getBackwardReferencedPapers: mock({ papers: Object.values(Papers).slice(0, 3) }),
            getPaperPdf: vi.fn(),
            setPaperPdf: vi.fn(),
        },
    };
    return mockBackend;
});

// If window is defined, mock matchMedia
// window is not defined in unit tests i.e. when running in node environment
// window.matchMedia needs to be mocked for the Toaster component to work
if (typeof window !== "undefined") {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
}
