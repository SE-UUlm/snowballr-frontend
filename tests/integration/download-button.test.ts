import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test, vi } from "vitest";
import DownloadButton from "$lib/components/composites/DownloadButton.svelte";
import userEvent from "@testing-library/user-event";

describe("DownloadButton", () => {
    test("When the download button is hovered, then the tooltip is shown", async () => {
        render(DownloadButton, {
            props: {
                loadingPaperId: Promise.resolve("1"),
            },
        });

        const downloadButton = screen.getByRole("button");
        expect(downloadButton).toHaveAttribute("aria-label", "Download this paper");

        await userEvent.hover(downloadButton);
        await waitFor(() => {
            expect(downloadButton).toHaveAttribute("data-state", "delayed-open");
        });

        const tooltip = screen.getByText("Download this paper");
        expect(tooltip).toBeInTheDocument();
    });

    test("When the download button is clicked, then the download function is executed (currently signaled by an event dispatch)", async () => {
        const mockDownloadPaper = vi.fn();

        render(DownloadButton, {
            props: {
                loadingPaperId: Promise.resolve("1"),
            },
        });
        addEventListener("downloadPaper", mockDownloadPaper);

        const downloadButton = screen.getByRole("button");
        await userEvent.click(downloadButton);

        expect(mockDownloadPaper).toBeCalled();
    });
});
