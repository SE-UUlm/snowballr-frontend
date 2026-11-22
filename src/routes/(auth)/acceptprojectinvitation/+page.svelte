<script lang="ts">
    import { goto } from "$app/navigation";
    import { Button } from "$lib/components/primitives/button";
    import { isApiError, type ApiError } from "$lib/api/errors";
    import { createActionError, isActionError, type ActionError } from "$lib/model/action-error.js";
    import { resolve } from "$app/paths";

    let { data } = $props();
    const { acceptancePromise } = $derived(data);

    type InvitationAcceptanceError = ActionError | ApiError;

    function getErrorDetails(error: InvitationAcceptanceError): ActionError {
        if (isActionError(error)) {
            return error;
        }

        if (isApiError(error, "invalid-argument")) {
            return createActionError(
                "Accepting the Project Invitation Failed",
                {
                    customDetails:
                        "This acceptance link is invalid. Please check the link and try again.",
                },
                error,
            );
        }
        if (isApiError(error, "not-found")) {
            return createActionError(
                "Accepting the Project Invitation Failed",
                {
                    customDetails:
                        "The acceptance link has probably expired. Please contact the project admin to send a new invitation." +
                        " The project may also have been deleted in the meantime.",
                },
                error,
            );
        }
        if (isApiError(error, "failed-precondition")) {
            return createActionError(
                "Accepting the Project Invitation Failed",
                { customDetails: "Please register before accepting the invitation." },
                error,
            );
        }
        return createActionError(
            "Server Error",
            {
                customDetails:
                    "We couldn't connect to our servers to accept you invitation. Please check your internet connection and try again.",
            },
            error,
        );
    }

    // svelte-ignore state_referenced_locally
    acceptancePromise
        .then(() => {
            setTimeout(async () => await goto(resolve("/signin")), 3000);
        })
        .catch(() => {
            // No redirect, errors are shown in the UI
            // This prevents unhandled promise rejection
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

        <Button class="mt-6" onclick={() => goto(resolve("/signin"))}>Back to Sign In</Button>
    {:catch error}
        {@const errorDetails = getErrorDetails(error)}
        <h1 class="mb-4 text-8xl">{errorDetails?.errorTitle}</h1>
        <div class="text-default">{errorDetails?.errorDetails}</div>

        <Button class="mt-6" onclick={() => goto(resolve("/signup"))}>Back to Sign Up</Button>
    {/await}
</main>
