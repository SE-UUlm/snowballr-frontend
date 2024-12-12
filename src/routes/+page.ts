import type { PageLoad } from "./$types";
import type { Project, ProjectMetadata } from "$lib/model/backend";

export const load: PageLoad = async () => {
    const DemoUsers = {
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

    const projectMetadataSimpleExamples: ProjectMetadata[] = [
        {
            project: createProject({ id: 1, name: "Field-Sensitive Pointer Analysis ..." }),
            members: [DemoUsers.felixSchlegel],
            stage: 1,
            stageProgress: 22,
        },
        {
            project: createProject({ id: 2, name: "SnowballR" }),
            members: [DemoUsers.felixSchlegel, DemoUsers.lucaSchlecker, DemoUsers.lucaSchlecker],
            stage: 1,
            stageProgress: 82,
        },
    ];

    const projectMetadataExamples = projectMetadataSimpleExamples.concat(
        Array(15)
            .fill(0)
            .map((_, i) => {
                return {
                    project: createProject({ id: i, name: `Demo Project ${i}` }),
                    members: [DemoUsers.johnDoe, DemoUsers.janeDoe],
                    stage: 1,
                    stageProgress: Math.random() * 100,
                };
            }),
    );

    return { projectMetadata: projectMetadataExamples };
};
