import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import AcceptButton from "$lib/components/composites/paper-components/paper-view/decision-buttons/AcceptButton.svelte";
import { loading } from "$tests/model-builder";

describe("AcceptButton", () => {
    test("When button is shown, then button has text", async () => {
        render(AcceptButton, {
            target: document.body,
            props: {
                loadingPaperId: loading("1"),
            },
        });

        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent("Accept");
    });
});
