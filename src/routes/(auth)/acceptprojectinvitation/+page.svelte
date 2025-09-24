<script lang="ts">
    import { goto } from "$app/navigation";
    import { Button } from "$lib/components/primitives/button";
    import type { RpcError } from "@protobuf-ts/runtime-rpc";
    import { GrpcStatusCode } from "@protobuf-ts/grpcweb-transport";
    import { getGrpcStatusCode } from "$lib/utils/common-helper";

    let { data } = $props();
    const { acceptancePromise: acceptancePromise } = data;

    type ErrorDetails = { headline: string; body: string } | RpcError;

    function getErrorDetails(error: ErrorDetails): { headline: string; body: string } {
        const customError = error as { headline: string; body: string };
        if (customError.headline && customError.headline) {
            return customError;
        }

        const rpcError = error as RpcError;
        const statusCodeValue = getGrpcStatusCode(rpcError.code);

        switch (statusCodeValue) {
            case GrpcStatusCode.INVALID_ARGUMENT:
                return {
                    headline: "Accepting Failed",
                    body: "This Acceptance link is invalid. Please check the link and try again.",
                };
            case GrpcStatusCode.DEADLINE_EXCEEDED:
                return {
                    headline: "Accepting Failed",
                    body: "The Acceptance link has expired. Please check the link and try again.",
                };
            case GrpcStatusCode.FAILED_PRECONDITION:
                return {
                    headline: "Accepting Failed",
                    body: "Please register before accepting the invitation.",
                };
            default:
                console.error(
                    "Unexpected error occurred during project invitation acceptance:",
                    rpcError,
                );
                return {
                    headline: "Server Error",
                    body: "We couldn't connect to our servers to accept you ivnitation. Please check your internet connection and try again.",
                };
        }
    }

    acceptancePromise?.then(() => {
        setTimeout(async () => await goto("/signin"), 3000);
    });
</script>

<svelte:head>
    {#await acceptancePromise}
        <title>Accept Project Invitation | Verifying...</title>
    {:then}
        <title>Accept Project Invitation | Success</title>
    {:catch}
        <title>Accept Project Invitation | Failed</title>
    {/await}
</svelte:head>

<main class="flex h-full w-full flex-col items-center justify-center gap-1 text-center">
    {#await acceptancePromise}
        <h1 class="mb-4 text-8xl">Accepting...</h1>
        <div class="text-default">Please wait while we check your acceptance link.</div>
    {:then}
        <h1 class="mb-4 text-8xl">Success!</h1>
        <div class="text-default">
            You have successfully accepted the project invitation. You will be redirected to the
            sign-in page shortly.
        </div>

        <Button class="mt-6" onclick={() => goto("/signin")}>Back to Sign In</Button>
    {:catch error}
        {@const errorDetails = getErrorDetails(error)}
        <h1 class="mb-4 text-8xl">{errorDetails.headline}</h1>
        <div class="text-default">{errorDetails.body}</div>

        <Button class="mt-6" onclick={() => goto("/signup")}>Back to Sign Up</Button>
    {/await}
</main>
