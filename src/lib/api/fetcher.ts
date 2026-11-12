import { Nothing } from "snowballr-api/base";
import type { FetcherInformation, FetcherOptions } from "snowballr-api/fetcher";
import { client } from "./client";
import { call } from "./grpc";

export type Fetchers = { [key: string]: FetcherOptions };

/**
 * Loads the fetchers that the backend offers for finding papers.
 *
 * @returns The available fetchers
 */
export async function getAvailableFetchers(): Promise<FetcherInformation[]> {
    const { fetchers } = await call(client.getAvailableFetchers(Nothing));
    return fetchers;
}
