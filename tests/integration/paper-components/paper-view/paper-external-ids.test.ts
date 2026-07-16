import PaperExternalIds from "$lib/components/composites/paper-components/paper-view/PaperExternalIds.svelte";
import { render, screen, waitFor, within } from "@testing-library/svelte";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { loading, createPaper } from "../../../model-builder";
import { waitForComponentLoading } from "../../test-helper";
import { stringifyPaper } from "$lib/utils/model-helper";
import userEvent from "@testing-library/user-event";
import { EXTERNAL_ID_TYPE_OPTIONS } from "$lib/model/external-id-type";

// Dialogs/tooltips disable pointer events on the body while their close animation is in progress.
// Since tests run in random order (see `sequence.shuffle` in vite.config.ts), a trigger element from
// a freshly rendered component may briefly inherit this before the previous test's animation settles.
async function waitUntilClickable(element: HTMLElement) {
    await waitFor(() => {
        expect(element).not.toHaveStyle({ pointerEvents: "none" });
    });
}

describe.sequential("PaperExternalIds", () => {
    beforeEach(() => {
        // Apparently, these methods are not implemented in jsdom but used by the Select/Dialog components
        // See https://github.com/testing-library/user-event/discussions/1087
        // They are necessary when clicking the select trigger
        window.HTMLElement.prototype.hasPointerCapture = () => true;
        window.HTMLElement.prototype.releasePointerCapture = vi.fn();
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    test("When the paper has external ids, then a badge is shown for each of them", async () => {
        const paper = createPaper({
            externalIds: [
                { type: "DOI", value: "10.1234/abc" },
                { type: "URL", value: "https://example.com" },
            ],
        });

        render(PaperExternalIds, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                paper: stringifyPaper(paper),
                isInEditMode: false,
            },
        });

        await waitForComponentLoading();

        const span = screen.getByTestId("details-label");
        expect(span.textContent).toEqual("External IDs");

        expect(screen.getByText("DOI")).toBeInTheDocument();
        expect(screen.getByText("URL")).toBeInTheDocument();
        expect(screen.queryByText("10.1234/abc")).not.toBeInTheDocument();
        expect(screen.queryByText("https://example.com")).not.toBeInTheDocument();
    });

    test("When a badge is hovered, then its value is shown", async () => {
        const user = userEvent.setup();
        const paper = createPaper({ externalIds: [{ type: "DOI", value: "10.1234/abc" }] });

        render(PaperExternalIds, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                paper: stringifyPaper(paper),
                isInEditMode: false,
            },
        });

        await waitForComponentLoading();

        const badge = screen.getByText("DOI");
        await waitUntilClickable(badge);
        await user.hover(badge);

        expect(await screen.findByText("10.1234/abc")).toBeInTheDocument();
    });

    test("When a badge is clicked, then its value is shown", async () => {
        const user = userEvent.setup();
        const paper = createPaper({ externalIds: [{ type: "DOI", value: "10.1234/abc" }] });

        render(PaperExternalIds, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                paper: stringifyPaper(paper),
                isInEditMode: false,
            },
        });

        await waitForComponentLoading();

        const badge = screen.getByText("DOI");
        await waitUntilClickable(badge);
        await user.click(badge);

        expect(await screen.findByText("10.1234/abc")).toBeInTheDocument();
    });

    test("When the paper has no external ids, then a placeholder is shown", async () => {
        const paper = createPaper({ externalIds: [] });

        render(PaperExternalIds, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                paper: stringifyPaper(paper),
                isInEditMode: false,
            },
        });

        await waitForComponentLoading();

        expect(screen.getByText("No External IDs available")).toBeInTheDocument();
    });

    test("When paper is loading, then skeleton is shown", () => {
        const paper = createPaper();

        render(PaperExternalIds, {
            target: document.body,
            props: {
                loadingPaper: loading(paper, 1000),
                paper: stringifyPaper(paper),
                isInEditMode: false,
            },
        });

        const span = screen.getByTestId("details-label");
        expect(span.textContent).toEqual("External IDs");
        expect(screen.queryByTestId("skeleton")).not.toBeNull();
    });

    test("When paper loading failed, then error text is shown", async () => {
        const paper = createPaper();

        render(PaperExternalIds, {
            target: document.body,
            props: {
                loadingPaper: Promise.reject(),
                paper: stringifyPaper(paper),
                isInEditMode: false,
            },
        });

        await waitForComponentLoading();

        const errorSpan = screen.getByTestId("error-indicator-label");
        expect(errorSpan.textContent).toEqual("Couldn't load External IDs");
    });

    test("When not in edit mode, then the edit button is not shown", async () => {
        const paper = createPaper();

        render(PaperExternalIds, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                paper: stringifyPaper(paper),
                isInEditMode: false,
            },
        });

        await waitForComponentLoading();

        expect(screen.queryByTestId("edit-external-ids-btn")).not.toBeInTheDocument();
    });

    test("When the edit button is clicked, then the edit dialog is opened", async () => {
        const user = userEvent.setup();
        const paper = createPaper({ externalIds: [{ type: "DOI", value: "10.1234/abc" }] });

        render(PaperExternalIds, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                paper: stringifyPaper(paper),
                isInEditMode: true,
            },
        });

        await waitForComponentLoading();

        expect(screen.queryByTestId("external-ids-dialog")).not.toBeInTheDocument();

        const editButton = screen.getByTestId("edit-external-ids-btn");
        await waitUntilClickable(editButton);
        await user.click(editButton);

        const dialog = screen.getByTestId("external-ids-dialog");
        expect(dialog).toBeInTheDocument();

        const row0 = within(dialog).getByTestId("external-id-row-0");
        expect(within(row0).getByText("DOI")).toBeInTheDocument();
        expect(within(row0).getByTestId("toggleable-input-external-id-value-0")).toHaveValue(
            "10.1234/abc",
        );

        await user.click(within(dialog).getByTestId("close-external-ids-dialog-btn"));
    });

    test("When the add button is clicked, then a new empty external id row is added", async () => {
        const user = userEvent.setup();
        const paper = createPaper({ externalIds: [] });

        render(PaperExternalIds, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                paper: stringifyPaper(paper),
                isInEditMode: true,
            },
        });

        await waitForComponentLoading();

        const editButton = screen.getByTestId("edit-external-ids-btn");
        await waitUntilClickable(editButton);
        await user.click(editButton);
        const dialog = screen.getByTestId("external-ids-dialog");

        expect(within(dialog).queryByTestId("external-id-row-0")).not.toBeInTheDocument();

        await user.click(within(dialog).getByTestId("add-external-id-btn"));

        const row0 = within(dialog).getByTestId("external-id-row-0");
        expect(within(row0).getByText("No type selected")).toBeInTheDocument();
        expect(within(row0).getByTestId("toggleable-input-external-id-value-0")).toHaveValue("");

        await user.click(within(dialog).getByTestId("close-external-ids-dialog-btn"));
    });

    test("When the remove button of a row is clicked, then the row is removed", async () => {
        const user = userEvent.setup();
        const paper = createPaper({
            externalIds: [
                { type: "DOI", value: "10.1234/abc" },
                { type: "URL", value: "https://example.com" },
            ],
        });

        render(PaperExternalIds, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                paper: stringifyPaper(paper),
                isInEditMode: true,
            },
        });

        await waitForComponentLoading();

        const editButton = screen.getByTestId("edit-external-ids-btn");
        await waitUntilClickable(editButton);
        await user.click(editButton);
        const dialog = screen.getByTestId("external-ids-dialog");

        expect(within(dialog).getByTestId("external-id-row-1")).toBeInTheDocument();

        await user.click(within(dialog).getByTestId("remove-external-id-btn-1"));

        expect(within(dialog).queryByTestId("external-id-row-1")).not.toBeInTheDocument();
        expect(
            within(within(dialog).getByTestId("external-id-row-0")).getByTestId(
                "toggleable-input-external-id-value-0",
            ),
        ).toHaveValue("10.1234/abc");

        await user.click(within(dialog).getByTestId("close-external-ids-dialog-btn"));
    });

    test("When a type is selected, then it is no longer available for other rows", async () => {
        const user = userEvent.setup();
        const paper = createPaper({
            externalIds: [
                { type: "", value: "" },
                { type: "", value: "" },
            ],
        });

        render(PaperExternalIds, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                paper: stringifyPaper(paper),
                isInEditMode: true,
            },
        });

        await waitForComponentLoading();

        const editButton = screen.getByTestId("edit-external-ids-btn");
        await waitUntilClickable(editButton);
        await user.click(editButton);
        const dialog = screen.getByTestId("external-ids-dialog");

        const row0 = within(dialog).getByTestId("external-id-row-0");
        await user.click(within(row0).getByText("No type selected"));
        await user.click(screen.getByRole("option", { name: "DOI" }));

        expect(within(row0).getByText("DOI")).toBeInTheDocument();

        const row1 = within(dialog).getByTestId("external-id-row-1");
        await user.click(within(row1).getByText("No type selected"));

        // Excluded from the now-open listbox since it is already used by row0. Options hidden in a
        // closed listbox are ignored by getByRole, unlike getByText.
        expect(screen.queryByRole("option", { name: "DOI" })).not.toBeInTheDocument();

        await user.click(within(dialog).getByTestId("close-external-ids-dialog-btn"));
    });

    test("When all available types are used, then the add button is disabled", async () => {
        const user = userEvent.setup();
        const paper = createPaper({
            externalIds: EXTERNAL_ID_TYPE_OPTIONS.map((option) => ({
                type: option.value,
                value: "some-value",
            })),
        });

        render(PaperExternalIds, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                paper: stringifyPaper(paper),
                isInEditMode: true,
            },
        });

        await waitForComponentLoading();

        const editButton = screen.getByTestId("edit-external-ids-btn");
        await waitUntilClickable(editButton);
        await user.click(editButton);
        const dialog = screen.getByTestId("external-ids-dialog");

        expect(within(dialog).getByTestId("add-external-id-btn")).toBeDisabled();

        await user.click(within(dialog).getByTestId("close-external-ids-dialog-btn"));
    });

    test("When the dialog is closed, then the badges reflect the changes made", async () => {
        const user = userEvent.setup();
        const paper = createPaper({ externalIds: [{ type: "DOI", value: "10.1234/abc" }] });

        render(PaperExternalIds, {
            target: document.body,
            props: {
                loadingPaper: loading(paper),
                paper: stringifyPaper(paper),
                isInEditMode: true,
            },
        });

        await waitForComponentLoading();

        const editButton = screen.getByTestId("edit-external-ids-btn");
        await waitUntilClickable(editButton);
        await user.click(editButton);
        const dialog = screen.getByTestId("external-ids-dialog");

        await user.click(within(dialog).getByTestId("remove-external-id-btn-0"));
        await user.click(within(dialog).getByTestId("close-external-ids-dialog-btn"));

        expect(screen.queryByTestId("external-ids-dialog")).not.toBeInTheDocument();
        expect(screen.getByText("No External IDs available")).toBeInTheDocument();
    });
});
