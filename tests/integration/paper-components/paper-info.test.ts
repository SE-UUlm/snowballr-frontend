import PaperInfo from "$lib/components/composites/paper-components/PaperInfo.svelte";
import { createPaper, loading } from "$tests/model-builder";
import { render, screen } from "@testing-library/svelte";
import { describe, test } from "vitest";
import { waitForComponentLoading } from "../test-helper";

describe("PaperInfo", () => {
    test("When paper ID is a UUID, then only the first 8 characters are shown", async () => {
        render(PaperInfo, {
            props: {
                loadingPaper: loading(createPaper()),
                loadingPaperId: loading("bc74a857-d8a8-446a-a3cc-197f1b113635"),
            },
        });

        await waitForComponentLoading();

        screen.getByText("#bc74a857", { exact: true });
    });

    test("When paper ID is a numeric string, then the full ID is shown", async () => {
        render(PaperInfo, {
            props: {
                loadingPaper: loading(createPaper()),
                loadingPaperId: loading("1234567890"),
            },
        });

        await waitForComponentLoading();

        screen.getByText("#1234567890", { exact: true });
    });
});
