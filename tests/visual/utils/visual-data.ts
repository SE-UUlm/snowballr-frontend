import type { AuthSnowballRClient } from "$tests/e2e/utils/helper/mock-backend";
import { CriterionCategory } from "$api/criterion";
import type { Paper } from "$api/paper";
import { PaperDecision, Project, Project_Paper, ProjectStatus } from "$api/project";
import { ReviewDecision } from "$api/review";

/*
Fixed, hand-written data for the visual regression tests.

It is deliberately independent of `tests/example-data.ts` and `tests/model-builder.ts`: any change to
this data changes the screenshots, so it must only change together with the baselines.

The mock backend assigns ids sequentially, so `seedVisualData` creates everything one after another
(never in parallel) to get the same ids in every run.
 */

export const ACTIVE_PROJECT_NAME = "Testing Microservice Architectures";
export const ARCHIVED_PROJECT_NAME = "Static Analysis Tools Survey";
export const INVITED_USER_EMAIL = "bob.miller@example.com";

type PaperData = Omit<Paper, "id" | "backwardReferencedIds">;

export const PAPERS = {
    contractTesting: {
        title: "Consumer-Driven Contract Testing for Microservices",
        abstrakt:
            "We evaluate consumer-driven contract testing in three industrial microservice systems and report on defect detection and maintenance effort.",
        year: 2021,
        publisher: "IEEE",
        publicationName: "International Conference on Software Testing",
        publicationType: "Conference Paper",
        hasPdf: true,
        authors: [
            { firstName: "Maria", lastName: "Keller" },
            { firstName: "Jonas", lastName: "Weber" },
        ],
        externalIds: [{ type: "DOI", displayType: "DOI", value: "10.1109/ICST.2021.00012" }],
        fetcherMetadata: {},
    },
    chaosEngineering: {
        title: "Chaos Engineering in Practice: A Multi-Case Study",
        abstrakt:
            "This study investigates how organizations adopt chaos engineering to improve the resilience of distributed systems.",
        year: 2022,
        publisher: "ACM",
        publicationName: "Empirical Software Engineering",
        publicationType: "Journal Article",
        hasPdf: false,
        authors: [
            { firstName: "Lena", lastName: "Fischer" },
            { firstName: "Tom", lastName: "Becker" },
            { firstName: "Sara", lastName: "Hoffmann" },
        ],
        externalIds: [{ type: "DOI", displayType: "DOI", value: "10.1007/s10664-022-10144-x" }],
        fetcherMetadata: {},
    },
    endToEndFlakiness: {
        title: "On the Flakiness of End-to-End Tests in Service-Based Systems",
        abstrakt:
            "We analyze flaky end-to-end tests in open-source service-based systems and classify their root causes.",
        year: 2023,
        publisher: "Springer",
        publicationName: "Software Quality Journal",
        publicationType: "Journal Article",
        hasPdf: true,
        authors: [{ firstName: "David", lastName: "Schulz" }],
        externalIds: [{ type: "DOI", displayType: "DOI", value: "10.1007/s11219-023-09621-4" }],
        fetcherMetadata: {},
    },
    serviceVirtualization: {
        title: "Service Virtualization for Integration Testing",
        abstrakt:
            "A systematic mapping study on service virtualization techniques used to test service integrations in isolation.",
        year: 2020,
        publisher: "Elsevier",
        publicationName: "Journal of Systems and Software",
        publicationType: "Journal Article",
        hasPdf: false,
        authors: [
            { firstName: "Anna", lastName: "Wagner" },
            { firstName: "Paul", lastName: "Neumann" },
        ],
        externalIds: [{ type: "DOI", displayType: "DOI", value: "10.1016/j.jss.2020.110654" }],
        fetcherMetadata: {},
    },
    testSelection: {
        title: "Regression Test Selection for Microservices",
        abstrakt:
            "We propose a change-impact based regression test selection approach for microservice architectures.",
        year: 2024,
        publisher: "IEEE",
        publicationName: "Transactions on Software Engineering",
        publicationType: "Journal Article",
        hasPdf: true,
        authors: [
            { firstName: "Felix", lastName: "Braun" },
            { firstName: "Julia", lastName: "Zimmermann" },
        ],
        externalIds: [{ type: "DOI", displayType: "DOI", value: "10.1109/TSE.2024.3361234" }],
        fetcherMetadata: {},
    },
} satisfies Record<string, PaperData>;

export type PaperKey = keyof typeof PAPERS;

/**
 * Which papers are part of the active project, in which stage, how the user reviewed them, and
 * which final decision the paper has.
 */
const PROJECT_PAPERS: {
    paper: PaperKey;
    stage: bigint;
    review?: ReviewDecision;
    decision?: PaperDecision;
}[] = [
    {
        paper: "contractTesting",
        stage: 0n,
        review: ReviewDecision.ACCEPTED,
        decision: PaperDecision.ACCEPTED,
    },
    {
        paper: "chaosEngineering",
        stage: 0n,
        review: ReviewDecision.DECLINED,
        decision: PaperDecision.DECLINED,
    },
    { paper: "endToEndFlakiness", stage: 0n },
    { paper: "serviceVirtualization", stage: 1n },
    { paper: "testSelection", stage: 1n },
];

const CRITERIA = [
    {
        tag: "I1",
        name: "Microservices",
        description: "The paper addresses microservice or service-based architectures.",
        category: CriterionCategory.INCLUSION,
    },
    {
        tag: "I2",
        name: "Testing",
        description: "The paper proposes or evaluates a testing technique.",
        category: CriterionCategory.INCLUSION,
    },
    {
        tag: "E1",
        name: "Not peer-reviewed",
        description: "The paper was not published in a peer-reviewed venue.",
        category: CriterionCategory.EXCLUSION,
    },
];

const READING_LIST: PaperKey[] = ["contractTesting", "endToEndFlakiness"];

export type VisualData = {
    activeProjectId: string;
    archivedProjectId: string;
    paperIds: Record<PaperKey, string>;
    /** Project paper ids of the active project, keyed by paper. */
    projectPaperIds: Record<PaperKey, string>;
    criterionIds: string[];
};

/**
 * Creates the visual test data through the API as the authenticated user of `apiClient`.
 * Must run against a fresh mock backend so that the ids are always the same.
 */
export async function seedVisualData(apiClient: AuthSnowballRClient): Promise<VisualData> {
    const activeProject = await apiClient.createProject({ name: ACTIVE_PROJECT_NAME }).response;
    const archivedProject = await apiClient.createProject({ name: ARCHIVED_PROJECT_NAME }).response;
    await apiClient.updateProject({
        project: Project.create({ id: archivedProject.id, status: ProjectStatus.ARCHIVED }),
        mask: { paths: ["project.status"] },
    }).response;

    const criterionIds: string[] = [];
    for (const criterion of CRITERIA) {
        const created = await apiClient.createCriterion({
            ...criterion,
            projectId: activeProject.id,
        }).response;
        criterionIds.push(created.id);
    }

    const paperIds = {} as Record<PaperKey, string>;
    for (const [key, paper] of Object.entries(PAPERS) as [PaperKey, PaperData][]) {
        const created = await apiClient.createPaper({
            ...paper,
            id: "",
            backwardReferencedIds: [],
        }).response;
        paperIds[key] = created.id;
    }

    const projectPaperIds = {} as Record<PaperKey, string>;
    for (const { paper, stage, review, decision } of PROJECT_PAPERS) {
        const projectPaper = await apiClient.addPaperToProject({
            projectId: activeProject.id,
            paperId: paperIds[paper],
            stage,
        }).response;
        projectPaperIds[paper] = projectPaper.id;

        if (review !== undefined) {
            await apiClient.createReview({
                projectPaperId: projectPaper.id,
                decision: review,
                selectedCriteriaIds:
                    review === ReviewDecision.ACCEPTED
                        ? criterionIds.slice(0, 2)
                        : [criterionIds[2]],
            }).response;
        }

        if (decision !== undefined) {
            // Explicit mask: never derive it from `Project_Paper.create`, which fills in defaults.
            await apiClient.updateProjectPaper({
                projectPaper: Project_Paper.create({ id: projectPaper.id, decision }),
                mask: { paths: ["project_paper.decision"] },
            }).response;
        }
    }

    await apiClient.inviteUserToProject({
        projectId: activeProject.id,
        userEmail: INVITED_USER_EMAIL,
    }).response;

    for (const paper of READING_LIST) {
        await apiClient.addPaperToReadingList({ id: paperIds[paper] }).response;
    }

    return {
        activeProjectId: activeProject.id,
        archivedProjectId: archivedProject.id,
        paperIds,
        projectPaperIds,
        criterionIds,
    };
}
