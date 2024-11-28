import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import TestPaperCard from "./TestPaperCard.svelte";

describe("PaperCard", () => {
    test("When tabs are provided as prop, then the tabs are listed in the tab list", () => {
        render(TestPaperCard, {
            target: document.body,
            props: {
                tabs: [
                    { value: "details", label: "Details" },
                    { value: "research-context", label: "Research Context" },
                ],
            },
        });

        const tabs = screen.getAllByRole("tab");
        expect(tabs).toHaveLength(2);
        expect(tabs[0]).toHaveTextContent("Details");
        expect(tabs[1]).toHaveTextContent("Research Context");
    });

    test("When no tabs are provided, then the tab list is empty", () => {
        render(TestPaperCard, {
            target: document.body,
            props: {
                tabs: [],
            },
        });

        const tabs = screen.queryAllByRole("tab");
        expect(tabs).toHaveLength(0);
    });
});
