import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { waitForComponentLoading } from "../test-helper";
import { loading } from "../../model-builder";
import StageProgress from "$lib/components/composites/statistics-components/StageProgress.svelte";
import type { StageProgressInterface } from "$lib/model/component-interfaces";

describe("StageProgressComponent", () => {
    test("When all required props are provided, then the stage progress component is completely shown.", async () => {
        render(StageProgress, {
            props: {
                stageProgress: loading<StageProgressInterface>({
                    stage: 0n,
                    decisions: { "Not reviewed": 2, Accepted: 2, Undecided: 2, Declined: 2 },
                }),
            },
        });

        await waitForComponentLoading();

        expect(screen.getByText("Stage")).toBeInTheDocument();
        expect(screen.getByText("0")).toBeInTheDocument();

        expect(screen.getByRole("list").childElementCount).toBe(4); // = number of items in the legend

        const chart = screen.getByTestId("stage-progress-chart");
        expect(chart).toBeInTheDocument();
        expect(chart.children[0].childElementCount).toBe(4); // = number of segments

        expect(screen.getByTestId("stage-progress")).not.toHaveTextContent(
            "Couldn't load project information.",
        );
    });
});
