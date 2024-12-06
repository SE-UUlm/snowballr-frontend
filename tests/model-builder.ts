import {
    type Author,
    type Paper,
    type Project,
    ReviewDecision,
    type User,
} from "$lib/model/backend";

export function createUser(user: Partial<User>): User {
    return {
        id: 0,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        isAdmin: false,
        status: "active",
        ...user,
    };
}

export const Users = {
    johnDoe: {
        id: 0,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        isAdmin: true,
        status: "active",
    },
    janeDoe: {
        id: 1,
        firstName: "Jane",
        lastName: "Doe",
        email: "jane.doe@example.com",
        isAdmin: false,
        status: "active",
    },
};

export function createProject(project: Partial<Project>): Project {
    return {
        id: 0,
        name: "Foo",
        reviewDecisionMatrix: {
            numberOfReviewers: 2,
            patterns: new Map(),
        },
        similarityThreshold: 0.7,
        paperFetchApis: ["bar"],
        ...project,
    };
}

export function createAuthor(author: Partial<Author>): Author {
    return {
        id: 0,
        firstName: "John",
        lastName: "Doe",
        orcid: "foo",
        ...author,
    };
}

export const Authors = {
    johnDoe: {
        id: 0,
        firstName: "John",
        lastName: "Doe",
        orcid: "foo",
    },
    janeDoe: {
        id: 1,
        firstName: "Jane",
        lastName: "Doe",
        orcid: "bar",
    },
};

export function createPaper(paper: Partial<Paper>): Paper {
    return {
        id: 0,
        doi: "doi",
        title: "Foo",
        abstrakt: "Bar",
        year: 1912,
        type: "paper",
        authors: [Authors.johnDoe],
        backwardReferencedPaperIds: [],
        forwardReferencedPaperIds: [],
        reviewData: {
            finalDecision: ReviewDecision.Declined,
            reviews: [
                {
                    user: Users.johnDoe,
                    finished: true,
                    decision: ReviewDecision.Declined,
                    selectedCriteriaIds: [],
                },
            ],
        },
        ...paper,
    };
}
