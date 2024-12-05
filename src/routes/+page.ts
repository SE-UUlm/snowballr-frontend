import type { PageLoad } from "./$types";
import type { Project, ProjectMetadata, User } from "$lib/model/backend";

export const load: PageLoad = async () => {
    function createUser(user: Partial<User>): User {
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

    const Users = {
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
        felixSchlegel: {
            id: 2,
            status: "active",
            firstName: "Felix",
            lastName: "Schlegel",
            isAdmin: true,
            email: "",
        },
        lucaSchlecker: {
            id: 3,
            status: "active",
            firstName: "Luca",
            lastName: "Schlecker",
            isAdmin: false,
            email: "",
        },
        leonhardAlkewitz: {
            id: 4,
            status: "active",
            firstName: "Leonhard",
            lastName: "Alkewitz",
            isAdmin: false,
            email: "",
        },
    };

    function createProject(project: Partial<Project>): Project {
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

    const projectMetadataExamples: ProjectMetadata[] = [
        {
            project: createProject({ id: 0, name: "Demo Project" }),
            members: [Users.johnDoe, Users.janeDoe],
            stage: 2,
            stageProgress: 70,
        },
        {
            project: createProject({ id: 1, name: "Field-Sensitive Pointer Analysis ..." }),
            members: [
                Users.felixSchlegel,
                createUser({ id: 7, firstName: "Florian", lastName: "Sihler" }),
            ],
            stage: 1,
            stageProgress: 22,
        },
        {
            project: createProject({ id: 2, name: "SnowballR" }),
            members: [Users.felixSchlegel, Users.lucaSchlecker, Users.lucaSchlecker],
            stage: 1,
            stageProgress: 82,
        },
    ];

    return { projectMetadata: projectMetadataExamples };
};
