import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import DeclineButton from "$lib/components/composites/paper-components/paper-view/decision-buttons/DeclineButton.svelte";
import { loading } from "$tests/model-builder";

describe("DeclineButton", () => {
    test("When button is shown, then button has text", async () => {
        render(DeclineButton, {
            target: document.body,
            props: {
                loadingPaperId: loading("1"),
            },
        });

        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent("Decline");
    });
});
