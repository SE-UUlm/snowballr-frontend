import type { PageLoad } from "./$types";
import { BackendController } from "$lib/controller/backend-controller";
import {
    type Paper,
    type Project,
    type ProjectMetadata,
    type StageEntry,
    type User,
} from "$lib/model/backend";
import { calculateStageProgress } from "$lib/utils/statistics-helper";

async function requestProjectMetadata(project: Project): Promise<ProjectMetadata> {
    const members: User[] = await BackendController.getInstance().project(project.id).getMembers();
    const currentStage: number = await BackendController.getInstance()
        .project(project.id)
        .getStageCount();
    const allPapersInCurrentStage: StageEntry[] = await BackendController.getInstance()
        .project(project.id)
        .stage(currentStage)
        .getPapers();

    return {
        project: project,
        members: members,
        stage: currentStage,
        stageProgress: calculateStageProgress(
            allPapersInCurrentStage.map((stageEntry: StageEntry): Paper => stageEntry.paper),
        ),
    };
}

/**
 * Loads projects for the user logged in.
 *
 * Therefore, request the project ids of the projects, the user logged in is member of and use
 * these ids to request:
 * <ul>
 *     <li>the project members</li>
 *     <li>the current project stage</li>
 *     <li>the progress of the current stage</li>
 * </ul>
 *
 * TODO: check, whether this can be handled with a single request, e.g. on route /projects/[id]/projectMetadata/.
 */
export const load: PageLoad = () => {
    const projectMetadata = BackendController.getInstance()
        .thisUser()
        .getAllProjects()
        .then(async (projects: Project[]) => {
            try {
                return await Promise.all(
                    projects.map((project: Project) => requestProjectMetadata(project)),
                );
            } catch {
                throw new Error("Could not load project details.");
            }
        })
        .catch(() => {
            throw new Error("Could not load projects.");
        });

    // attach noop-catch to handle promise rejection correctly (see https://svelte.dev/docs/kit/load#Streaming-with-promises)
    projectMetadata.catch(() => {});

    return { projectMetadata };

    // uncomment the following lines, if you want to test the projects list with a lot of projects
    /* const Users = {
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

    const projectMetadataExamples: ProjectMetadata[] = Array(20)
        .fill(0)
        .map((_, i) => {
            return {
                project: createProject({ id: i, name: `Demo Project ${i}` }),
                members: [Users.johnDoe, Users.janeDoe],
                stage: 1,
                stageProgress: Math.random() * 100,
            };
        });

    const projectMetadata: Promise<ProjectMetadata[]> = new Promise((resolve, reject) =>
        setTimeout(() => {
            // resolve(projectMetadataExamples);
            reject(new Error("Bla bla"));
        }, 2000),
    );
    */

    // return { projectMetadata };
};
