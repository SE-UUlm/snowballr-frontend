import type { Criterion } from "snowballr-api/criterion";
import { client } from "./client";
import { call } from "./grpc";

/**
 * Loads the review criteria of a project.
 *
 * @param projectId - The ID of the project
 * @returns The criteria, possibly none
 */
export async function listCriteria(projectId: string): Promise<Criterion[]> {
    const { criteria } = await call(client.getAllCriteriaForProject({ id: projectId }));
    return criteria;
}
