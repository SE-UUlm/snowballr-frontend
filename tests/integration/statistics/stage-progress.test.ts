import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { waitForComponentLoading } from "../test-helper";
import { loading } from "../../model-builder";
import StageProgress, {
    type StageProgressInterface,
} from "$lib/components/composites/statistics/StageProgress.svelte";
import { PaperDecision } from "$lib/model/api/project";

describe("StageProgress", () => {
    test("When all required props are provided, then the stage progress component is completely shown.", async () => {
        render(StageProgress, {
            props: {
                stageProgress: loading<StageProgressInterface>({
                    stage: 0n,
                    decisions: {
                        statistics: [
                            { decision: PaperDecision.UNREVIEWED, count: 2n },
                            { decision: PaperDecision.ACCEPTED, count: 2n },
                            { decision: PaperDecision.IN_REVIEW, count: 2n },
                            { decision: PaperDecision.DECLINED, count: 2n },
                        ],
                    },
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

    test("When no decisions are provided, then the stage progress component is shown but with a complete ring.", async () => {
        render(StageProgress, {
            props: {
                stageProgress: loading<StageProgressInterface>({
                    stage: 0n,
                    decisions: {
                        statistics: [
                            { decision: PaperDecision.UNREVIEWED, count: 0n },
                            { decision: PaperDecision.ACCEPTED, count: 0n },
                            { decision: PaperDecision.IN_REVIEW, count: 0n },
                            { decision: PaperDecision.DECLINED, count: 0n },
                        ],
                    },
                }),
            },
        });

        await waitForComponentLoading();

        expect(screen.getByRole("list").childElementCount).toBe(4); // = number of items in the legend

        const chart = screen.getByTestId("stage-progress-chart");
        expect(chart).toBeInTheDocument();
        expect(chart.children[0].childElementCount).toBe(1); // = number of segments
        expect(chart.children[0].children[0]).toHaveClass("text-gray-200"); // = color of segment

        expect(screen.getByTestId("stage-progress")).not.toHaveTextContent(
            "Couldn't load project information.",
        );
    });
});
