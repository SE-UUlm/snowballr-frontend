<script lang="ts">
    import { goto } from "$app/navigation";
    import { Button } from "$lib/components/primitives/button";
    import type { RpcError } from "@protobuf-ts/runtime-rpc";
    import { GrpcStatusCode } from "@protobuf-ts/grpcweb-transport";

    let { data } = $props();
    const { verificationPromise } = data;

    type ErrorDetails = { headline: string; body: string } | RpcError;

    function getErrorDetails(error: ErrorDetails): { headline: string; body: string } {
        const customError = error as { headline: string; body: string };
        if (customError.headline && customError.headline) {
            return customError;
        }

        const rpcError = error as RpcError;
        const statusCodeValue = GrpcStatusCode[rpcError.code as keyof typeof GrpcStatusCode];

        switch (statusCodeValue) {
            case GrpcStatusCode.INVALID_ARGUMENT:
                return {
                    headline: "Verification Failed",
                    body: "This verification link is invalid. Please try signing up again to receive a new link.",
                };
            case GrpcStatusCode.DEADLINE_EXCEEDED:
                return {
                    headline: "Verification Failed",
                    body: "The verification link has expired. Please try signing up again to receive a new link.",
                };
            default:
                console.error("Unexpected error occurred during email verification:", error);
                return {
                    headline: "Server Error",
                    body: "We couldn't connect to our servers to verify your email. Please check your internet connection and try again.",
                };
        }
    }

    verificationPromise?.then(() => {
        setTimeout(async () => await goto("/signin"), 3000);
    });
</script>

<svelte:head>
    {#await verificationPromise}
        <title>Email Verification | Verifying...</title>
    {:then}
        <title>Email Verification | Success</title>
    {:catch}
        <title>Email Verification | Failed</title>
    {/await}
</svelte:head>

<main class="flex h-full w-full flex-col items-center justify-center gap-1 text-center">
    {#await verificationPromise}
        <h1 class="mb-4 text-8xl">Verifying...</h1>
        <div class="text-default">Please wait while we check your verification link.</div>
    {:then}
        <h1 class="mb-4 text-8xl">Success!</h1>
        <div class="text-default">
            Your email address has been successfully verified. You will be automatically redirected
            to the sign-in page.
        </div>

        <Button class="mt-6" onclick={() => goto("/signin")}>Back to Sign In</Button>
    {:catch error}
        {@const errorDetails = getErrorDetails(error)}
        <h1 class="mb-4 text-8xl">{errorDetails.headline}</h1>
        <div class="text-default">{errorDetails.body}</div>

        <Button class="mt-6" onclick={() => goto("/signup")}>Back to Sign Up</Button>
    {/await}
</main>
