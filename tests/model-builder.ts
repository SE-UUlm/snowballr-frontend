import type { User } from "$lib/model/api/user";
import type { Author, Paper } from "$lib/model/api/paper";
import {
    SnowballingType,
    type Project,
    type Project_Paper,
    type Project_Settings,
} from "$lib/model/api/project";
import { Authors, Criteria, Papers, ProjectPapers, Projects, Reviews, Users } from "./example-data";
import type {
    IndependentPaperViewProps,
    NonProjectPaperViewProps,
    PaperViewProps,
    ProjectPaperViewProps,
} from "$lib/components/composites/paper-components/paper-view/PaperView.svelte";
import type { Review } from "$lib/model/api/review";
import type { CriterionWithReviews } from "$lib/model/general";
import type { Criterion } from "$lib/model/api/criterion";

/**
 * Simulates a loading state for a given value.
 *
 * @param value - The value to be resolved after the timeout.
 * @param timeoutInMs - The timeout duration in milliseconds. Default is 0.
 * @returns A promise that resolves to the given value after the specified timeout.
 */
export function loading<T>(value: T, timeoutInMs: number = 0): Promise<T> {
    return new Promise<T>((resolve) => {
        setTimeout(() => {
            resolve(value);
        }, timeoutInMs);
    });
}

/**
 * Simulates an error loading state for a given error.
 *
 * @param errorMessage - The error message to be rejected with.
 * @param timeoutInMs - The timeout duration in milliseconds. Default is 0.
 * @returns A promise that rejects with the given error after the specified timeout.
 */
export function errorLoading(errorMessage: string, timeoutInMs: number = 0): Promise<never> {
    return new Promise<never>((_, reject) => {
        setTimeout(() => {
            reject(new Error(errorMessage));
        }, timeoutInMs);
    });
}

export function createUser(user: Partial<User> = {}): User {
    return {
        ...Users.johnDoe,
        ...user,
    };
}

export function createAuthor(author: Partial<Author> = {}): Author {
    return {
        ...Authors.johnDoe,
        ...author,
    };
}

export function createProject(project: Partial<Project> = {}): Project {
    return {
        ...Projects.demoProject,
        ...project,
    };
}

export function createPaper(paper: Partial<Paper> = {}): Paper {
    return {
        ...Papers.demoPaper1,
        ...paper,
    };
}

export function createProjectPaper(paper: Partial<Project_Paper> = {}): Project_Paper {
    return {
        ...ProjectPapers.demoProjectPaper1,
        ...paper,
    };
}

export function createReview(review: Partial<Review> = {}): Review {
    return {
        ...Reviews.demoReview1,
        ...review,
    };
}

export function createReviewedCriterion(
    props: Partial<CriterionWithReviews> = {},
): CriterionWithReviews {
    return {
        ...Criteria.demoCriterion1,
        reviews: [Reviews.demoReview1, Reviews.demoReview2],
        ...props,
    };
}

export function createCriterion(criterion: Partial<Criterion> = {}): Criterion {
    return {
        ...Criteria.demoCriterion1,
        ...criterion,
    };
}

export function createProjectPaperViewProps(
    props: Partial<ProjectPaperViewProps> = {},
): ProjectPaperViewProps {
    return {
        loadingPaper: loading(createProjectPaper()),
        loadingProject: loading(createProject()),
        reviewers: loading([]),
        criteriaWithReviews: loading([]),
        ...props,
    };
}

export function createNonProjectPaperViewProps(
    props: Partial<NonProjectPaperViewProps> = {},
): NonProjectPaperViewProps {
    return {
        loadingPaper: loading(createPaper()),
        loadingProject: undefined,
        reviewers: undefined,
        criteriaWithReviews: undefined,
        ...props,
    };
}

export function createProjectSettings(props: Partial<Project_Settings> = {}): Project_Settings {
    return {
        reviewMaybeAllowed: true,
        similarityThreshold: 0.5,
        fetcherApis: [],
        snowballingType: SnowballingType.BOTH,
        ...props,
    };
}

export function createPaperViewProps(
    props: Partial<IndependentPaperViewProps> = {},
    dependentProps?: ProjectPaperViewProps | NonProjectPaperViewProps,
): PaperViewProps {
    return {
        user: createUser(),
        backwardReferencedPapers: loading([]),
        forwardReferencedPapers: loading([]),
        showButtonBar: false,
        backRef: "",
        ...(dependentProps ?? {
            loadingPaper: loading(createProjectPaper()),
            loadingProject: loading(createProject()),
            reviewers: loading([]),
            criteriaWithReviews: loading([]),
            isProjectPaperView: true,
        }),
        ...props,
    };
}
