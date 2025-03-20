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

export function loading<T>(value: T, timeoutInMs: number = 0): Promise<T> {
    return new Promise<T>((resolve) => {
        setTimeout(() => {
            resolve(value);
        }, timeoutInMs);
    });
}

export function createProjectPaperViewProps(
    props: Partial<ProjectPaperViewProps> = {},
): ProjectPaperViewProps {
    return {
        loadingPaper: loading(createProjectPaper()),
        loadingProject: loading(createProject()),
        reviewers: Promise.resolve([]),
        criteriaWithReviews: Promise.resolve([]),
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
        backwardReferencedPapers: Promise.resolve([]),
        forwardReferencedPapers: Promise.resolve([]),
        showButtonBar: false,
        backRef: "",
        ...(dependentProps ?? {
            loadingPaper: loading(createProjectPaper()),
            loadingProject: loading(createProject()),
            reviewers: Promise.resolve([]),
            criteriaWithReviews: Promise.resolve([]),
            isProjectPaperView: true,
        }),
        ...props,
    };
}
