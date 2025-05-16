import { expect, test } from "@playwright/test";
import { DockerMockBackend } from "./mock-backend";

test.describe("Backend Unreachable", () => {
    let backend: DockerMockBackend;
    test.beforeAll(async () => {
        backend = await DockerMockBackend.create();
    });
    test.afterAll(() => backend.dispose());

    test("When the backend is unreachable, then an alert dialog is displayed", async ({ page }) => {
        await page.goto("/");
        await expect(page.getByRole("alertdialog", { name: "An Error Occurred!" })).toBeVisible();
    });

    test("When the backend is reachable, then no alert dialog is displayed", async ({ page }) => {
        await backend.setupRouting(page);

        await page.goto("/");
        await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
        await expect(
            page.getByRole("alertdialog", { name: "An Error Occurred!" }),
        ).not.toBeVisible();
    });
});
