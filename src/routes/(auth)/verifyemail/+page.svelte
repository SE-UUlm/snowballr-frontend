<script lang="ts">
    import { goto } from "$app/navigation";
    import { Button } from "$lib/components/primitives/button";
    import type { RpcError } from "@protobuf-ts/runtime-rpc";
    import { GrpcStatusCode } from "@protobuf-ts/grpcweb-transport";
    import { getGrpcStatusCode } from "$lib/utils/common-helper";
    import { createActionError, isActionError, type ActionError } from "$lib/model/action-error";
    import { resolve } from "$app/paths";

    let { data } = $props();
    const { verificationPromise } = $derived(data);

    type EmailVerificationError = ActionError | RpcError;

    function getErrorDetails(error: EmailVerificationError): ActionError {
        if (isActionError(error)) {
            return error;
        }

        const statusCodeValue = getGrpcStatusCode(error.code);
        switch (statusCodeValue) {
            case GrpcStatusCode.INVALID_ARGUMENT:
                return createActionError(
                    "Email Verification Failed",
                    {
                        customDetails:
                            "This verification link is invalid. Please try signing up again to receive a new link.",
                    },
                    error,
                );
            case GrpcStatusCode.NOT_FOUND:
                return createActionError(
                    "Email Verification Failed",
                    {
                        customDetails:
                            "The verification link has probably expired. Please try signing up again to receive a new link.",
                    },
                    error,
                );
            default:
                return createActionError(
                    "Server Error",
                    {
                        customDetails:
                            "We couldn't connect to our servers to verify your email. Please check your internet connection and try again.",
                    },
                    error,
                );
        }
    }

    // svelte-ignore state_referenced_locally
    verificationPromise
        .then(() => {
            setTimeout(async () => await goto(resolve("/signin")), 3000);
        })
        .catch(() => {
            // No redirect, errors are shown in the UI
            // This prevents unhandled promise rejection
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

        <Button class="mt-6" onclick={() => goto(resolve("/signin"))}>Back to Sign In</Button>
    {:catch error}
        {@const errorDetails = getErrorDetails(error)}
        <h1 class="mb-4 text-8xl">{errorDetails?.errorTitle}</h1>
        <div class="text-default">{errorDetails?.errorDetails}</div>

        <Button class="mt-6" onclick={() => goto(resolve("/signup"))}>Back to Sign Up</Button>
    {/await}
</main>
