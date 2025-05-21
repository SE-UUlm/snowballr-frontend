<script lang="ts">
    import Input from "$lib/components/composites/input/Input.svelte";
    import PasswordInput from "$lib/components/composites/input/PasswordInput.svelte";
    import { Button } from "$lib/components/primitives/button/index.js";
    import * as Card from "$lib/components/primitives/card/index.js";
    import { backendService } from "$lib/grpc-api";
    import { Schema } from "$lib/schemas";
    import type { ApiError } from "$lib/model/general";
    import ErrorAlert from "$lib/components/composites/utils/ErrorAlert.svelte";
    import { StatusCodes } from "$lib/model/error-codes";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { AuthenticationStatus } from "$lib/model/api/authentication";
    import { Nothing } from "$lib/model/api/base";
    import { cn } from "$lib/utils/shadcn-helper";

    let firstNameInput: Input;
    let lastNameInput: Input;
    let emailInput: Input;
    let passwordInput: PasswordInput;

    let registrationError: ApiError | undefined = $state(undefined);

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

        const isFirstNameValid = firstNameInput.validate();
        const isLastNameValid = lastNameInput.validate();
        const isEmailValid = emailInput.validate();
        const isPasswordValid = passwordInput.validate();
        if (!(isFirstNameValid && isLastNameValid && isEmailValid && isPasswordValid)) {
            let failedInput: string;
            if (!isFirstNameValid) failedInput = "First Name";
            else if (!isLastNameValid) failedInput = "Last Name";
            else if (!isEmailValid) failedInput = "Email";
            else if (!isPasswordValid) failedInput = "Password";
            else throw "unreachable";

            registrationError = {
                errorTitle: "Input Validation Failed",
                errorDetails: `The Input "${failedInput}" contains an error.`,
            };
            return;
        }

        const userData = {
            firstName: firstNameInput.getValue(),
            lastName: lastNameInput.getValue(),
            email: emailInput.getValue(),
            password: passwordInput.getValue(),
        };

        await backendService
            .register(userData)
            .then(() => {
                goto("/");
            })
            .catch((error) => {
                if (error.code === StatusCodes.ALREADY_EXISTS) {
                    registrationError = {
                        errorTitle: "An account with this email address already exists.",
                        errorDetails: "Try logging in or resetting your password",
                    };
                } else {
                    registrationError = { errorTitle: "Something went wrong while registration." };
                }
                console.error(error);
            });
    }
</script>

<svelte:head>
    <title>Sign Up</title>
</svelte:head>

<Card.Root
    class={cn(
        "flex w-full max-w-xl flex-col border-slate-500 shadow-lg",
        isLoading ? "opacity-0" : "",
    )}
>
    <Card.Header class="flex w-full flex-col">
        <Card.Title class="text-3xl">Sign Up</Card.Title>
        <Card.Description>Enter your information to create an account</Card.Description>
    </Card.Header>
    <Card.Content class="flex w-full flex-col">
        <form class="flex flex-col gap-5" onsubmit={handleSubmit}>
            <div class="flex w-full flex-row gap-5">
                <Input
                    bind:this={firstNameInput}
                    class="w-full"
                    errorMessagePrefix="First name must contain"
                    inputId="first-name-input"
                    label="First Name"
                    placeholder="John"
                    required
                    schema={Schema.firstName}
                    type="text"
                />
                <Input
                    bind:this={lastNameInput}
                    class="w-full"
                    errorMessagePrefix="Last name must contain"
                    inputId="last-name-input"
                    label="Last Name"
                    placeholder="Doe"
                    required
                    schema={Schema.lastName}
                    type="text"
                />
            </div>
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
            <PasswordInput bind:this={passwordInput} class="w-full" />
            <Button class="w-full" type="submit">Create an account</Button>
            {#if registrationError}
                <ErrorAlert
                    errorDetails={registrationError.errorDetails}
                    errorTitle={registrationError.errorTitle}
                />
            {/if}
        </form>
        <div class="mt-4 text-center text-sm">
            Already have an account?
            <a class="underline" href="/signin"> Sign In </a>
        </div>
    </Card.Content>
</Card.Root>
