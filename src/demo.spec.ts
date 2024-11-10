import assert from "assert";
import { describe, it, expect } from "vitest";

function a(resolve: () => void) {
    setTimeout(() => {
        resolve();
    }, 1000);
}

describe("sum test 1", () => {
    it("adds 1 + 2 to equal 3", async () => {
        await new Promise<void>((resolve) => {
            a(resolve);
        });
    });
});

describe("sum test 2", () => {
    it("adds 1 + 2 to equal 3", async () => {
        await new Promise<void>((resolve) => {
            a(resolve);
        });
    });
});

describe("sum test 3", () => {
    it("adds 1 + 2 to equal 3", async () => {
        assert.strictEqual(1 + 2, 2);
    });
});
