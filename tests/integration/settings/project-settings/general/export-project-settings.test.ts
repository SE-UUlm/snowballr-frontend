import { describe, expect, test } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import ExportProjectSettings from "$lib/components/composites/settings/project-settings/general/ExportProjectSettings.svelte";
import { Projects } from "$tests/example-data";
import userEvent from "@testing-library/user-event";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

describe("ExportProjectSettings", () => {
    test("When all props are provided, then it renders correctly", async () => {
        render(ExportProjectSettings, {
            target: document.body,
            props: {
                projectId: Projects.demoProjectActive.id,
            },
        });

        expect(screen.getByRole("heading", { name: "Export Project" })).toBeInTheDocument();
        expect(screen.queryByText("Loading formats ...")).toBeInTheDocument();

        const exportButton = screen.getByRole("button", { name: "Export Project" });
        expect(exportButton).toBeInTheDocument();
        expect(exportButton).toBeDisabled();

        const formatSelect = screen.getByText("No format selected");
        expect(formatSelect).toBeInTheDocument();
    });

    test("When the export formats are loaded, then they are shown in the select dropdown", async () => {
        const mockGetAvailableFormats = mockApiCall("getAvailableExportFormats", {
            formats: ["JSON", "YAML", "XML"],
        });

        render(ExportProjectSettings, {
            target: document.body,
            props: {
                projectId: Projects.demoProjectActive.id,
            },
        });

        await waitFor(() => {
            expect(mockGetAvailableFormats).toHaveBeenCalled();
        });

        const formatSelect = screen.getByText("No format selected");
        await userEvent.click(formatSelect);

        expect(screen.getByRole("option", { name: "JSON" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "YAML" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "XML" })).toBeInTheDocument();
    });

    test("When loading the export formats fails, then an alert is shown", async () => {
        const mockGetAvailableFormats = mockFailedApiCall("getAvailableExportFormats");

        render(ExportProjectSettings, {
            target: document.body,
            props: {
                projectId: Projects.demoProjectActive.id,
            },
        });

        await waitFor(() => {
            expect(mockGetAvailableFormats).toHaveBeenCalled();
        });

        const alert = await screen.findByRole("alert", {
            name: "Failed to Load the Export Formats",
        });
        expect(alert).toBeInTheDocument();
    });

    test("When the user selects an export format, then the export button is enabled", async () => {
        const mockGetAvailableFormats = mockApiCall("getAvailableExportFormats", {
            formats: ["JSON", "YAML", "XML"],
        });

        render(ExportProjectSettings, {
            target: document.body,
            props: {
                projectId: Projects.demoProjectActive.id,
            },
        });

        await waitFor(() => {
            expect(mockGetAvailableFormats).toHaveBeenCalled();
        });

        const formatSelect = screen.getByText("No format selected");
        const exportButton = screen.getByRole("button", { name: "Export Project" });
        expect(exportButton).toBeDisabled();

        await userEvent.click(formatSelect);
        const jsonOption = screen.getByRole("option", { name: "JSON" });
        await userEvent.click(jsonOption);

        expect(exportButton).toBeEnabled();
    });

    test("When exporting the project fails, then an alert is shown", async () => {
        const mockGetAvailableFormats = mockApiCall("getAvailableExportFormats", {
            formats: ["JSON", "YAML", "XML"],
        });
        const mockExportProject = mockFailedApiCall("exportProject");

        render(ExportProjectSettings, {
            target: document.body,
            props: {
                projectId: Projects.demoProjectActive.id,
            },
        });

        await waitFor(() => {
            expect(mockGetAvailableFormats).toHaveBeenCalled();
        });

        const formatSelect = screen.getByText("No format selected");
        const exportButton = screen.getByRole("button", { name: "Export Project" });

        await userEvent.click(formatSelect);
        const jsonOption = screen.getByRole("option", { name: "JSON" });
        await userEvent.click(jsonOption);

        await userEvent.click(exportButton);

        await waitFor(() => {
            expect(mockExportProject).toHaveBeenCalled();
        });

        const alert = await screen.findByRole("alert", { name: "Failed to Export the Project" });
        expect(alert).toBeInTheDocument();
    });

    test("When exporting the project succeeds, then a download is performed", async () => {
        const mockGetAvailableFormats = mockApiCall("getAvailableExportFormats", {
            formats: ["JSON", "YAML", "XML"],
        });
        const mockExportProject = mockApiCall("exportProject", {
            fileName: "project-export.json",
            data: new Uint8Array([
                123, 34, 110, 97, 109, 101, 34, 58, 32, 34, 84, 101, 115, 116, 32, 80, 114, 111,
                106, 101, 99, 116, 34, 125,
            ]),
        });

        render(ExportProjectSettings, {
            target: document.body,
            props: {
                projectId: Projects.demoProjectActive.id,
            },
        });

        await waitFor(() => {
            expect(mockGetAvailableFormats).toHaveBeenCalled();
        });

        const formatSelect = screen.getByText("No format selected");
        const exportButton = screen.getByRole("button", { name: "Export Project" });

        await userEvent.click(formatSelect);
        const jsonOption = screen.getByRole("option", { name: "JSON" });
        await userEvent.click(jsonOption);

        await userEvent.click(exportButton);

        await waitFor(() => {
            expect(mockExportProject).toHaveBeenCalled();
            expect(global.URL.createObjectURL).toHaveBeenCalled();
            expect(global.URL.revokeObjectURL).toHaveBeenCalled();
        });
    });
});
