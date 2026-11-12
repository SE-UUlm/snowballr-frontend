import { Nothing } from "snowballr-api/base";
import { client } from "./client";
import { call } from "./grpc";

/** An exported project, ready to be saved as a file. */
export interface ProjectExport {
    data: Uint8Array;
    fileName: string;
}

/**
 * Loads the formats that projects can be exported to.
 *
 * @returns The names of the export formats
 */
export async function getAvailableExportFormats(): Promise<string[]> {
    const { formats } = await call(client.getAvailableExportFormats(Nothing));
    return formats;
}

/**
 * Exports a project.
 *
 * @param projectId - The ID of the project
 * @param format - The name of the export format, one of {@link getAvailableExportFormats}
 * @returns The exported file
 */
export async function exportProject(projectId: string, format: string): Promise<ProjectExport> {
    const { data, fileName } = await call(client.exportProject({ id: projectId, format }));
    return { data, fileName };
}
