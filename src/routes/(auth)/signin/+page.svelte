<script lang="ts">
    import Input from "$lib/components/composites/input/Input.svelte";
    import PasswordInput from "$lib/components/composites/input/PasswordInput.svelte";
    import { Button } from "$lib/components/primitives/button/index.js";
    import * as Card from "$lib/components/primitives/card/index.js";
    import { backendService } from "$lib/grpc-api";
    import { Schema } from "$lib/schemas";
    import type { ApiError } from "$lib/model/general";
    import { StatusCodes } from "$lib/model/error-codes";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { Nothing } from "$lib/model/api/base.js";
    import { AuthenticationStatus } from "$lib/model/api/authentication.js";
    import { cn } from "$lib/utils/shadcn-helper";
    import Alert from "$lib/components/composites/utils/Alert.svelte";

    let emailInput: Input;
    let passwordInput: PasswordInput;

    let signinError: ApiError | undefined = $state(undefined);

    let isLoading = $state(true);

    onMount(async () => {
        try {
            const authStatus = (await backendService.getAuthenticationStatus(Nothing).response)
                .authenticationStatus;
            if (authStatus === AuthenticationStatus.AUTHENTICATED) {
                await goto("/");
            }
        } catch {
            console.error("There was an error acquiring the authentication status.");
        }

        isLoading = false;
    });

    async function handleSubmit(event: Event) {
        event.preventDefault();
        signinError = undefined;

        const isEmailValid = emailInput.validate();
        if (!isEmailValid) {
            return;
        }

        const userData = {
            email: emailInput.getValue(),
            password: passwordInput.getValue(),
        };

        backendService
            .login(userData)
            .then(async () => await goto("/"))
            .catch((error) => {
                if (error.code === StatusCodes.UNAUTHENTICATED) {
                    signinError = {
                        errorTitle: "The provided credentials are not correct.",
                        errorDetails:
                            "Check if the email and password are correct or try resetting your password.",
                    };
                } else {
                    signinError = { errorTitle: "Something unknown went wrong." };
                }
                console.error(error);
            });
    }
</script>

<svelte:head>
    <title>Sign In</title>
</svelte:head>

<Card.Root
    class={cn(
        "flex w-full max-w-xl flex-col border-slate-500 shadow-lg",
        isLoading ? "opacity-0" : "",
    )}
>
    <Card.Header class="flex w-full flex-col">
        <Card.Title class="text-3xl">Sign In</Card.Title>
        <Card.Description>Enter your information to sign in to your account</Card.Description>
    </Card.Header>
    <Card.Content class="flex w-full flex-col">
        <form class="flex flex-col gap-5" onsubmit={handleSubmit}>
            <Input
                bind:this={emailInput}
                class="w-full"
                errorMessagePrefix="Email must have"
                inputId="email-input"
                label="Email"
                placeholder="john.doe@example.com"
                required
                schema={Schema.email}
                type="email"
            />
            <PasswordInput
                bind:this={passwordInput}
                class="w-full"
                link={{ href: "/resetpassword", text: "Forgot Password?" }}
                validate={false}
            />
            <Button class="w-full" type="submit">Sign In</Button>
            {#if signinError}
                <Alert
                    details={signinError.errorDetails}
                    title={signinError.errorTitle}
                    variant="error"
                />
            {/if}
        </form>
        <div class="mt-4 text-center text-sm">
            You don't have an account yet?
            <a class="underline" href="/signup"> Sign Up </a>
        </div>
    </Card.Content>
</Card.Root>
