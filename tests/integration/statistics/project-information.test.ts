import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/svelte";
import ProjectInformation from "$lib/components/composites/statistics/ProjectInformation.svelte";
import { waitForComponentLoading } from "../test-helper";
import { loading } from "../../model-builder";

describe("ProjectInformation", () => {
    test("When all required props are provided, then the project information component is completely shown.", async () => {
        render(ProjectInformation, {
            props: {
                projectInformation: loading({
                    projectName: "Demo",
                    projectStart: new Date("2020-01-01"),
                    projectStage: 1n,
                    daysInStage: 3,
                    estimatedRemainingDays: 1,
                    totalPapersInStage: 10,
                    reviewedPapersInStage: 5,
                }),
            },
        });

        await waitForComponentLoading();

        // Project information are shown
        const dateString = new Date("2020-01-01").toLocaleDateString();
        expect(screen.getByTestId("project-information")).toHaveTextContent(
            `started on ${dateString}`,
        );
        expect(screen.getByTestId("project-information")).toHaveTextContent("in stage 1");
        expect(screen.getByTestId("project-information")).toHaveTextContent("working 3 days");
        expect(screen.getByTestId("project-information")).toHaveTextContent("5 / 10");
        expect(screen.getByTestId("project-information")).toHaveTextContent("time will be 1 day");
        expect(screen.getByTestId("project-information")).not.toHaveTextContent(
            "time will be 1 days",
        );

        expect(screen.getByTestId("project-information")).not.toHaveTextContent(
            "Couldn't load project information.",
        );
    });

    test("When no paper has been decided yet, then the project information component does not show information about the estimated remaining time.", async () => {
        render(ProjectInformation, {
            props: {
                projectInformation: loading({
                    projectName: "Demo",
                    projectStart: new Date("2020-01-01"),
                    projectStage: 1n,
                    daysInStage: 3,
                    // What `(daysInStage * totalPapers) / reviewedPapers - daysInStage` yields
                    // when nothing has been decided: no review rate, so no finite projection
                    estimatedRemainingDays: Infinity,
                    totalPapersInStage: 4,
                    reviewedPapersInStage: 0,
                }),
            },
        });

        await waitForComponentLoading();

        expect(screen.getByTestId("project-information")).toHaveTextContent("0 / 4");

        expect(screen.getByTestId("project-information")).not.toHaveTextContent(
            "your estimated remaining time will be",
        );
        expect(screen.getByTestId("project-information")).not.toHaveTextContent("Infinity");
    });

    test("When the project was just created, then the project information component does not show information about the estimated remaining time.", async () => {
        render(ProjectInformation, {
            props: {
                projectInformation: loading({
                    projectName: "Demo",
                    projectStart: new Date(),
                    projectStage: 0n,
                    daysInStage: 0,
                    estimatedRemainingDays: 0 / 0,
                    totalPapersInStage: 0,
                    reviewedPapersInStage: 0,
                }),
            },
        });

        await waitForComponentLoading();

        // Project information are shown
        expect(screen.getByTestId("project-information")).toHaveTextContent("in stage 0");
        expect(screen.getByTestId("project-information")).toHaveTextContent("0 / 0");

        expect(screen.getByTestId("project-information")).not.toHaveTextContent(
            "your estimated remaining time will be",
        );
        expect(screen.getByTestId("project-information")).not.toHaveTextContent(
            "Couldn't load project information.",
        );
    });
});
