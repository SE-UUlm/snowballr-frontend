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
        expect(screen.getByTestId("project-information")).toHaveTextContent("started on 1/1/2020");
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
});
