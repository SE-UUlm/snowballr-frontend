import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import TestAlertDialog from "./TestAlertDialog.svelte";

describe("AlertDialog", () => {
    test("When all props are provided, then component is rendered correctly", () => {
        render(TestAlertDialog);

        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeInTheDocument();
        expect(trigger).toHaveTextContent("This is the alert dialog trigger");
        expect(trigger).toHaveClass("bg-red-500");
        expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
        expect(trigger).toHaveAttribute("data-state", "closed");
    });

    test("When trigger is clicked, then the alert dialog is opened", async () => {
        render(TestAlertDialog);

        const trigger = screen.getByTestId("alert-dialog-trigger");

        trigger.click();

        await waitFor(() => {
            expect(trigger).toHaveAttribute("data-state", "open");
        });

        const title = screen.getByText("This is the alert dialog title");
        expect(title).toBeInTheDocument();

        const description = screen.getByText("This is the alert dialog description");
        expect(description).toBeInTheDocument();

        const cancelButton = screen.getByTestId("alert-dialog-cancel");
        expect(cancelButton).toBeInTheDocument();
        expect(cancelButton).toHaveTextContent("Cancel");

        const actionButton = screen.getByTestId("alert-dialog-action");
        expect(actionButton).toBeInTheDocument();
        expect(actionButton).toHaveTextContent("Confirm");
        expect(actionButton).toHaveClass("bg-blue-500");
    });

    test("When error is passed, then error alert is shown", async () => {
        render(TestAlertDialog, { props: { error: {} } });

        const trigger = screen.getByTestId("alert-dialog-trigger");

        trigger.click();

        await waitFor(() => {
            expect(trigger).toHaveAttribute("data-state", "open");
        });

        const error = screen.getByText("An error occurred");
        expect(error).toBeInTheDocument();
    });

    test("When loading is passed, then action button is disabled", async () => {
        render(TestAlertDialog, { props: { loading: true } });

        const trigger = screen.getByTestId("alert-dialog-trigger");

        trigger.click();

        await waitFor(() => {
            expect(trigger).toHaveAttribute("data-state", "open");
        });

        const actionButton = screen.getByTestId("alert-dialog-action");
        expect(actionButton).toBeDisabled();
        const icons = actionButton.getElementsByTagName("svg");
        expect(icons.length).toBe(1);
    });

    test("When open = true is passed, then alert dialog is open", async () => {
        render(TestAlertDialog, { props: { open: true } });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toHaveAttribute("data-state", "open");

        const title = screen.getByText("This is the alert dialog title");
        expect(title).toBeInTheDocument();

        const description = screen.getByText("This is the alert dialog description");
        expect(description).toBeInTheDocument();

        const cancelButton = screen.getByTestId("alert-dialog-cancel");
        expect(cancelButton).toBeInTheDocument();

        const actionButton = screen.getByTestId("alert-dialog-action");
        expect(actionButton).toBeInTheDocument();
    });

    test("When open = false is passed, then alert dialog is closed", async () => {
        render(TestAlertDialog, { props: { open: false } });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toHaveAttribute("data-state", "closed");

        const title = screen.queryByText("This is the alert dialog title");
        expect(title).not.toBeInTheDocument();

        const description = screen.queryByText("This is the alert dialog description");
        expect(description).not.toBeInTheDocument();

        const cancelButton = screen.queryByText("alert-dialog-cancel");
        expect(cancelButton).not.toBeInTheDocument();

        const actionButton = screen.queryByText("alert-dialog-action");
        expect(actionButton).not.toBeInTheDocument();
    });
});
