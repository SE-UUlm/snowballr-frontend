import { PUBLIC_API_BASE_URL } from "$env/static/public";

/**
 * A simple HTTP client that can make requests to the backend API.
 *
 * This class is used to make requests to the backend API. It is a simple wrapper around the `fetch` API.
 * It uses the `PUBLIC_API_BASE_URL` environment variable to determine the base URL of the API.
 *
 * @example
 * const client = new HttpClient("api/v1/example");
 * await client.get();
 * await client.post({ data: "example" });
 * await client.put({ data: "example" });
 * await client.patch({ data: "example" });
 * await client.delete();
 */
export class HttpClient {
    private basePath: string;

    /**
     * Creates a new HTTP client.
     *
     * @param path The path to the API endpoint. This path will be appended to the `PUBLIC_API_BASE_URL` environment variable.
     *
     * @example
     * const client = new HttpClient("api/v1/example");
     * // When the `PUBLIC_API_BASE_URL` environment variable is `http://localhost:3000`
     * // the base URL of the API will be `http://localhost:3000/api/v1/example`
     */
    constructor(path: string = "") {
        this.basePath = `${PUBLIC_API_BASE_URL}${path ? `/${path}` : ""}`;
    }

    private async fetch<T>(
        path: string = "",
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
        body?: T,
        headers?: HeadersInit,
    ): Promise<Response> {
        return fetch(`${this.basePath}/${path}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * Makes a GET request to the API.
     *
     * @param path The path to the API endpoint. This path will be appended to the base URL of the API.
     * @param headers The headers to include in the request.
     * @returns A promise that resolves to the response from the API.
     */
    async get(path: string = "", headers?: HeadersInit): Promise<Response> {
        return this.fetch(path, "GET", undefined, headers);
    }

    /**
     * Makes a POST request to the API.
     *
     * @param path The path to the API endpoint. This path will be appended to the base URL of the API.
     * @param body The body of the request.
     * @param headers The headers to include in the request.
     * @returns A promise that resolves to the response from the API.
     */
    async post<T>(path: string = "", body?: T, headers?: HeadersInit): Promise<Response> {
        return this.fetch(path, "POST", body, headers);
    }

    /**
     * Makes a PUT request to the API.
     *
     * @param path The path to the API endpoint. This path will be appended to the base URL of the API.
     * @param body The body of the request.
     * @param headers The headers to include in the request.
     * @returns A promise that resolves to the response from the API.
     */
    async put<T>(path: string = "", body?: T, headers?: HeadersInit): Promise<Response> {
        return this.fetch(path, "PUT", body, headers);
    }

    /**
     * Makes a PATCH request to the API.
     *
     * @param path The path to the API endpoint. This path will be appended to the base URL of the API.
     * @param body The body of the request.
     * @param headers The headers to include in the request.
     * @returns A promise that resolves to the response from the API.
     */
    async patch<T>(path: string = "", body?: T, headers?: HeadersInit): Promise<Response> {
        return this.fetch(path, "PATCH", body, headers);
    }

    /**
     * Makes a DELETE request to the API.
     *
     * @param path The path to the API endpoint. This path will be appended to the base URL of the API.
     * @param headers The headers to include in the request.
     * @returns A promise that resolves to the response from the API.
     */
    async delete(path: string = "", headers?: HeadersInit): Promise<Response> {
        return this.fetch(path, "DELETE", undefined, headers);
    }
}
