import type { Criterion, CriterionCategory } from "snowballr-api/criterion";
import { client } from "./client";
import { call } from "./grpc";

/** The fields of a criterion that can be changed after it was created. */
export type CriterionFields = Pick<Criterion, "tag" | "name" | "description">;

/** A criterion that is not stored yet. */
export interface NewCriterion extends CriterionFields {
    projectId: string;
    category: CriterionCategory;
}

/**
 * Loads the review criteria of a project.
 *
 * @param projectId - The ID of the project
 * @returns The criteria, possibly none
 */
export async function listCriteria(projectId: string): Promise<Criterion[]> {
    const { criteria } = await call(() => client.getAllCriteriaForProject({ id: projectId }));
    return criteria;
}

/**
 * Creates a review criterion.
 *
 * @param criterion - The criterion to create, including the project it belongs to
 * @returns The created criterion
 */
export async function createCriterion(criterion: NewCriterion): Promise<Criterion> {
    return call(() => client.createCriterion(criterion));
}

/**
 * Changes the given fields of a review criterion and leaves all others as they are.
 *
 * @param criterion - The criterion as it is stored
 * @param changes - The fields to change, with their new values
 * @returns The updated criterion
 */
export async function updateCriterion(
    criterion: Criterion,
    changes: Partial<CriterionFields>,
): Promise<Criterion> {
    return call(() =>
        client.updateCriterion({
            criterion: { ...criterion, ...changes },
            // The editable fields are single words, so their names are already in snake_case.
            mask: { paths: Object.keys(changes).map((field) => `criterion.${field}`) },
        }),
    );
}

/**
 * Deletes a review criterion.
 *
 * @param criterionId - The ID of the criterion
 */
export async function deleteCriterion(criterionId: string): Promise<void> {
    await call(() => client.deleteCriterion({ id: criterionId }));
}
