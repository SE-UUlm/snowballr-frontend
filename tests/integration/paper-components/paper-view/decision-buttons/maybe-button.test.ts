import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import MaybeButton from "$lib/components/composites/paper-components/paper-view/decision-buttons/MaybeButton.svelte";

describe("MaybeButton", () => {
    test("When button is shown, then button has text", async () => {
        render(MaybeButton, {
            target: document.body,
            props: {
                paperId: 1,
            },
        });

        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent("Maybe");
    });
});
