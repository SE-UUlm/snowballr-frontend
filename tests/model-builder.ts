import type { User } from "$lib/model/api/user";
import type { Author, Paper } from "$lib/model/api/paper";
import type { Project, Project_Paper } from "$lib/model/api/project";
import { Authors, Papers, ProjectPapers, Projects, Users } from "./example-data";

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

export function createLoadingPaper(
    paper: Partial<Paper> = {},
    timeoutInMs: number = 0,
): Promise<Paper> {
    return new Promise<Paper>((resolve) => {
        setTimeout(() => {
            resolve(createPaper(paper));
        }, timeoutInMs);
    });
}

export function createLoadingProject(project: Partial<Project> = {}): Promise<Project> {
    return Promise.resolve(createProject(project));
}
