import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import TestStageEntryAccordion from "./TestStageEntryAccordion.svelte";
import userEvent from "@testing-library/user-event";
import { ProjectPapers } from "../../example-data";

describe("StageEntry", () => {
    test("When all props are provided, then component is shown correctly", async () => {
        render(TestStageEntryAccordion, {
            target: document.body,
            props: {
                projectId: "1",
                stage: {
                    stageIndex: 1n,
                    papers: [],
                },
            },
        });

        const stageEntry = screen.getByText("Stage 1");
        expect(stageEntry).toBeInTheDocument();

        const papersCount = screen.getByText("(0 papers)");
        expect(papersCount).toBeInTheDocument();
    });

    test("When stage entry is clicked, then papers of stage are shown", async () => {
        const user = userEvent.setup();
        render(TestStageEntryAccordion, {
            target: document.body,
            props: {
                projectId: "1",
                stage: {
                    stageIndex: 1n,
                    papers: [
                        ProjectPapers.demoProjectPaper1,
                        ProjectPapers.demoProjectPaper2,
                        ProjectPapers.demoProjectPaper3,
                    ],
                },
            },
        });

        const papersCount = screen.getByText("(3 papers)");
        expect(papersCount).toBeInTheDocument();

        const trigger = screen.getByTestId("stage-entry-trigger");
        expect(trigger).toBeInTheDocument();

        await user.click(trigger);

        const paper1 = screen.getByText(ProjectPapers.demoProjectPaper1.paper!.title);
        expect(paper1).toBeInTheDocument();

        const paper2 = screen.getByText(ProjectPapers.demoProjectPaper2.paper!.title);
        expect(paper2).toBeInTheDocument();

        const paper3 = screen.getByText(ProjectPapers.demoProjectPaper3.paper!.title);
        expect(paper3).toBeInTheDocument();

        const button = screen.getByText("Add Paper");
        expect(button).toBeInTheDocument();
    });
});
