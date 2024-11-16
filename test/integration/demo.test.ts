import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/svelte";
import Demo from "$lib/components/composites/Demo.svelte";

describe("demo test suite", () => {
    test("test", () => {
        render(Demo);
        expect(screen.getByRole("heading")).toBeInTheDocument();
    });
});
