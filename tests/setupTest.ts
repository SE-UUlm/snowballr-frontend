/* Test setup file, inspired by https://github.com/wd-David/svelte-component-test-recipes?tab=readme-ov-file#setuptestts */
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect, type Mock, type MockInstance, vi } from "vitest";
import * as environment from "$app/environment";
import * as navigation from "$app/navigation";
import {
    createCriterion,
    createPaper,
    createProject,
    createProjectPaper,
    createReview,
    createUser,
} from "./model-builder";
import { Criteria, Members, Papers, ProjectPapers, Projects, Reviews, Users } from "./example-data";
import type { ISnowballRClient } from "$api/main.client";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import { PaperDecision } from "$api/project";
import { AuthenticationStatus } from "$api/authentication";
import { backendService } from "$lib/grpc-api";
import ResizeObserver from "resize-observer-polyfill";

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
    onNavigate: () => {},
    preloadCode: () => Promise.resolve(),
    preloadData: () => Promise.resolve({ type: "loaded", status: 200, data: {} }),
    pushState: () => {},
    refreshAll: () => Promise.resolve(),
    replaceState: () => {},
}));

// Mock SvelteKit runtime module $app/state, inspired by https://stackoverflow.com/questions/79600853/how-to-mock-page-from-app-state-in-sveltekit-vitest-unit-tests
vi.mock("$app/state", async () => {
    // This is to avoid mocking of other logic implemented in $app/state,
    // it can be omitted if you don't care about it.
    const original = await vi.importActual("$app/state");

    return {
        ...original,
        page: { url: new URL("http://localhost") },
    };
});

// Mock SvelteKit runtime modules $env/static/public and $env/dynamic/public
vi.mock("$env/static/public", () => ({ env: {} }));
vi.mock("$env/dynamic/public", () => ({ env: {} }));

// Mock browser APIs (for integration tests)
if (typeof window !== "undefined") {
    // Mock window.matchMedia for responsive UI components (e.g., Toaster)
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation(function (query) {
            return {
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            };
        }),
    });
    // Mock functions related to pointer and scroll events for "Select" components work in integration tests.
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    window.HTMLElement.prototype.hasPointerCapture = vi.fn();
    window.HTMLElement.prototype.releasePointerCapture = vi.fn();
}

// Mock URL.createObjectURL and URL.revokeObjectURL for tests that involve file downloads
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();

// Use the ResizeObserver polyfill for tests
global.ResizeObserver = ResizeObserver;

// Utility types for mocking of gRPC API

/**
 * Mock of the {@link UnaryCall}.
 *
 * Only mocks the `response` property and ignores other properties of the `UnaryCall`.
 */
interface MockUnaryCall<T> {
    response: Promise<T>;
}

/**
 * Take the SnowballRClient interface and return a new "interface" type.
 * In the new type each api function returns a {@link MockUnaryCall} instead of `UnaryCall`
 */
type MockReturnType<T> = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [K in keyof T]: T[K] extends (...args: infer A) => UnaryCall<infer _I, infer R>
        ? Mock<(...args: A) => MockUnaryCall<R>>
        : T[K];
};
type MockApi = MockReturnType<ISnowballRClient>;

type InferPromiseType<T> = T extends Promise<infer U> ? U : never;
/**
 * Infers the return type of an API call by inferring the type of the response promise of the {@link UnaryCall}.
 *
 * @example
 * ```ts
 * type ReturnType = InferApiReturnType<"getAllUsers">;
 * // ReturnType is now { users: User[]; }
 * // as "getAllUsers" returns `UnaryCall<..., { users: User[] }>`
 * ```
 */
type InferApiCallReturnType<T extends keyof ISnowballRClient> = InferPromiseType<
    ReturnType<ISnowballRClient[T]>["response"]
>;

/**
 * Mocks a backend API call.
 *
 * @example
 * ```ts
 * // Mock returning of constant values
 * getAllUsers: mock(Object.values(Users)),
 *
 * // Mock returning of dynamic values
 * getUserById: mock(({ id }) => createUser({ id })),
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

/**
 * Get the returned value of a mock backend API call.
 *
 * @param fn - The mocked function
 * @returns The returned value of this mocked backend function
 */
export async function getReturnValue<T>(fn: MockInstance): Promise<T> {
    return (await fn.mock.results[0].value.response) as T;
}

// Mock the backend API.
//
// Here we mock the backend API calls that are used in the application for the integration tests.
// Note: This is only a base mock, you can and mostly should override this mock in your tests according to your needs.
// For example, you can mock the backend API to return an error or to return a specific response.
// It is not necessary to mock all the API calls, only the ones that are used in the test.
// See `invite-users-dialog.test.ts` for an example of how to override the mock.
vi.mock("$lib/grpc-api", () => {
    const mockBackend: { backendService: MockApi } = {
        backendService: {
            getAvailableFetchers: mock({
                fetcherNames: ["Google Scholar", "IEEE Xplore", "SpringerLink"],
            }),
            getAvailableFetcherOptions: mock({
                options: {
                    TEST: "FOOBAR",
                },
            }),
            register: vi.fn(),
            verifyEmail: vi.fn(),
            login: vi.fn(),
            logout: vi.fn(),
            getAuthenticationStatus: mock({
                authenticationStatus: AuthenticationStatus.AUTHENTICATED,
            }),
            renewSession: vi.fn(),
            requestPasswordReset: vi.fn(),
            resetPassword: vi.fn(),
            changePassword: vi.fn(),
            getAllUsers: mock({ users: Object.values(Users) }),
            getCurrentUser: mock(Users.johnDoe),
            getUserById: mock(({ id }) => createUser({ id })),
            getUserByEmail: mock(({ email }) => createUser({ email })),
            updateUser: vi.fn(),
            softDeleteUser: vi.fn(),
            softUndeleteUser: vi.fn(),
            getAllPapersToReview: mock({
                projectPapers: Object.values(ProjectPapers).filter((paper) =>
                    [PaperDecision.UNREVIEWED, PaperDecision.IN_REVIEW].includes(paper.decision),
                ),
            }),
            getPapersToReviewForProject: mock({
                projectPapers: Object.values(ProjectPapers).filter((paper) =>
                    [PaperDecision.UNREVIEWED, PaperDecision.IN_REVIEW].includes(paper.decision),
                ),
            }),
            getUserSettings: vi.fn(),
            updateUserSettings: vi.fn(),
            getReadingList: mock({ papers: Object.values(Papers) }),
            isPaperOnReadingList: mock({ value: false }),
            addPaperToReadingList: vi.fn(),
            removePaperFromReadingList: vi.fn(),
            inviteUserToProject: vi.fn(),
            acceptProjectInvitation: vi.fn(),
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
            getProjectInformation: vi.fn(),
            getDecisionStatisticsForStage: vi.fn(),
            getCriterionById: mock(({ id }) => createCriterion({ id })),
            getAllCriteriaForProject: mock({ criteria: Object.values(Criteria) }),
            createCriterion: vi.fn(),
            updateCriterion: vi.fn(),
            deleteCriterion: vi.fn(),
            getProjectPaperById: mock(({ id }) => createProjectPaper({ id })),
            getProjectPaperByRelativeId: vi.fn(),
            getAllProjectPapersForProject: mock({ projectPapers: Object.values(ProjectPapers) }),
            addPaperToProject: vi.fn(),
            updateProjectPaper: vi.fn(),
            removePaperFromProject: vi.fn(),
            getReviewById: mock(({ id }) => createReview({ id })),
            getAllReviewsForProjectPaper: mock({ reviews: Object.values(Reviews) }),
            createReview: mock(({ decision, selectedCriteriaIds }) =>
                createReview({ decision, selectedCriteriaIds }),
            ),
            updateReview: vi.fn(),
            deleteReview: vi.fn(),
            getPaperById: mock(({ id }) => createPaper({ id })),
            createPaper: vi.fn(),
            updatePaper: vi.fn(),
            getForwardReferencedPapers: mock({ papers: Object.values(Papers).slice(0, 3) }),
            getBackwardReferencedPapers: mock({ papers: Object.values(Papers).slice(0, 3) }),
            getPaperPdf: vi.fn(),
            setPaperPdf: vi.fn(),
            updateProjectMemberRole: vi.fn(),
            getNextPaper: mock(({ id }) => createProjectPaper({ id })),
            getNextPaperToReview: mock(({ id }) => createProjectPaper({ id })),
            getPreviousPaper: mock(({ id }) => createProjectPaper({ id })),
            getInviteCandidates: vi.fn(),
            getAvailableExportFormats: mock({ formats: ["JSON", "XML", "CSV"] }),
            searchLocalPapers: vi.fn(),
            searchFetcherPapers: vi.fn(),
        },
    };
    return mockBackend;
});

/**
 * Mocks an API call to return a specific value.
 *
 * @param methodName - The name of the method to mock
 * @param value - The value to return
 * @returns A mock instance of the API call
 */
export function mockApiCall<T extends keyof ISnowballRClient, R extends InferApiCallReturnType<T>>(
    methodName: T,
    value: R,
): MockInstance<ISnowballRClient[T]> {
    const apiCallToMock = (backendService[methodName] as Mock).mockClear();

    return apiCallToMock.mockImplementation(function () {
        return { response: Promise.resolve(value) };
    });
}

/**
 * Mocks an API call to return an error.
 *
 * @param methodName - The name of the method to mock
 * @param errorMessage - The error message to return
 * @returns A mock instance of the failed API call
 */
export function mockFailedApiCall<T extends keyof ISnowballRClient>(
    methodName: T,
    errorMessage = "",
): MockInstance<ISnowballRClient[T]> {
    const apiCallToMock = (backendService[methodName] as Mock).mockClear();

    return apiCallToMock.mockImplementation(function () {
        return { response: Promise.reject(new Error(errorMessage)) };
    });
}
