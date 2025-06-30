import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import SortOptionsSelect from "$lib/components/composites/select/SortOptionsSelect.svelte";

describe("SortOptionsSelect", () => {
    beforeEach(() => {
        // Apparently, these methods are not implemented in jsdom but used by the Select component
        // See https://github.com/testing-library/user-event/discussions/1087
        // They are necessary when clicking the select trigger
        window.HTMLElement.prototype.hasPointerCapture = () => true;
        window.HTMLElement.prototype.releasePointerCapture = vi.fn();
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    test("When no initial selected value is provided, then the default selected option is 'Id: Low to High'.", async () => {
        render(SortOptionsSelect);

        const trigger = screen.getByRole("button", { name: "Sort by: Id" });
        expect(trigger).toBeInTheDocument();
    });

    test("When a initial selected value is provided, then this initial value is selected and shown in the select trigger.", async () => {
        render(SortOptionsSelect, {
            props: {
                selectedSortOption: "Title: A to Z",
            },
        });

        const trigger = screen.getByRole("button", { name: "Sort by: Title" });
        expect(trigger).toBeInTheDocument();
    });

    test("When the user clicks the select trigger, all possible sort options are shown and one can be selected (exclusive).", async () => {
        const user = userEvent.setup();
        render(SortOptionsSelect);

        const trigger = screen.getByRole("button", { name: "Sort by: Id" });

        await user.click(trigger);

        const sortOptions = screen
            .getAllByRole("option")
            .map((option) => option.textContent?.trim());
        expect(sortOptions).toContain("Id: Low to High");
        expect(sortOptions).toContain("Id: High to Low");
        expect(sortOptions).toContain("Title: A to Z");
        expect(sortOptions).toContain("Title: A to Z");
        expect(sortOptions).toContain("Decision: Yes to No");
        expect(sortOptions).toContain("Decision: No to Yes");
        expect(sortOptions).toContain("Year: Oldest to Newest");
        expect(sortOptions).toContain("Year: Newest to Oldest");
    });
});
