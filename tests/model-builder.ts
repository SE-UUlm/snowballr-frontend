import type { User } from "$lib/model/api/user";
import type { Author, Paper } from "$lib/model/api/paper";
import type { Project, Project_Paper } from "$lib/model/api/project";
import { Authors, Criteria, Papers, ProjectPapers, Projects, Reviews, Users } from "./example-data";
import type { Review } from "$lib/model/api/review";
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
