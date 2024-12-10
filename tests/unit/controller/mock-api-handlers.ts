import { PUBLIC_API_BASE_URL } from "$env/static/public";
import { http, HttpResponse } from "msw";

export const handlers = [
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
