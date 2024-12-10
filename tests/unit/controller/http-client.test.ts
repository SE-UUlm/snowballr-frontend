import { HttpClient } from "$lib/controller/http-client";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { http, HttpResponse } from "msw";
import { PUBLIC_API_BASE_URL } from "$env/static/public";
import { setupServer } from "msw/node";

const handlers = [
    http.get(`${PUBLIC_API_BASE_URL}/test`, () => {
        return HttpResponse.json({
            data: "get-test",
        });
    }),

    http.post(`${PUBLIC_API_BASE_URL}/test`, () => {
        return HttpResponse.json({
            data: "post-test",
        });
    }),

    http.put(`${PUBLIC_API_BASE_URL}/test`, () => {
        return HttpResponse.json({
            data: "put-test",
        });
    }),

    http.patch(`${PUBLIC_API_BASE_URL}/test`, () => {
        return HttpResponse.json({
            data: "patch-test",
        });
    }),

    http.delete(`${PUBLIC_API_BASE_URL}/test`, () => {
        return HttpResponse.json({
            data: "delete-test",
        });
    }),

    http.get(`${PUBLIC_API_BASE_URL}`, () => {
        return HttpResponse.json({
            data: "get-root",
        });
    }),

    http.post(`${PUBLIC_API_BASE_URL}/echo`, async ({ request }) => {
        return HttpResponse.json(await request.json());
    }),
];

const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen());

// Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test. This is important for test isolation
afterEach(() => server.resetHandlers());

describe("HttpClient", () => {
    test("When get request is called, then correct data is returned", async () => {
        const httpClient = new HttpClient("test");

        const response = await httpClient.get();

        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ data: "get-test" });
    });

    test("When post request is called, then correct data is returned", async () => {
        const httpClient = new HttpClient("test");

        const response = await httpClient.post();

        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ data: "post-test" });
    });

    test("When put request is called, then correct data is returned", async () => {
        const httpClient = new HttpClient("test");

        const response = await httpClient.put();

        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ data: "put-test" });
    });

    test("When patch request is called, then correct data is returned", async () => {
        const httpClient = new HttpClient("test");

        const response = await httpClient.patch();

        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ data: "patch-test" });
    });

    test("When delete request is called, then correct data is returned", async () => {
        const httpClient = new HttpClient("test");

        const response = await httpClient.delete();

        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ data: "delete-test" });
    });

    test("When get request is called without path, then root data is returned", async () => {
        const httpClient = new HttpClient();

        const response = await httpClient.get();

        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ data: "get-root" });
    });

    test("When post request is called with body, then correct data is returned", async () => {
        const httpClient = new HttpClient();

        const response = await httpClient.post("echo", { data: "echo-test" });

        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ data: "echo-test" });
    });
});
