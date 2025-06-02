<script lang="ts">
    import Input from "$lib/components/composites/input/Input.svelte";
    import PasswordInput from "$lib/components/composites/input/PasswordInput.svelte";
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
    import LoadingButton from "$lib/components/composites/button/LoadingButton.svelte";
    import { loadingWrapper } from "$lib/utils/common-helper";

    let emailInput: Input;
    let passwordInput: PasswordInput;

    let signinError: ApiError | undefined = $state(undefined);

    let isLoadingAuthStatus = $state(true);
    const loading = $state({ value: false });

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

        isLoadingAuthStatus = false;
    });

    async function handleSubmit(event: Event) {
        event.preventDefault();
        signinError = undefined;

        if (!emailInput.validate()) return;

        const userData = {
            email: emailInput.getValue(),
            password: passwordInput.getValue(),
        };

        await backendService
            .login(userData)
            .then(async () => await goto("/"))
            .catch((error) => {
                if (error.code === StatusCodes.UNAUTHENTICATED) {
                    signinError = {
                        errorTitle: "Invalid Credentials",
                        errorDetails:
                            "The email or password you entered is incorrect. Please check your credentials or try resetting your password.",
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
        isLoadingAuthStatus ? "opacity-0" : "",
    )}
>
    <Card.Header class="flex w-full flex-col">
        <Card.Title class="text-3xl">Sign In</Card.Title>
        <Card.Description>Enter your credentials to sign in to your account</Card.Description>
    </Card.Header>
    <Card.Content class="flex w-full flex-col">
        <form
            class="flex flex-col gap-5"
            onsubmit={(args) => loadingWrapper(loading, handleSubmit, args)}
        >
            <Input
                bind:this={emailInput}
                class="w-full"
                disabled={isLoadingAuthStatus || loading.value}
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
                disabled={isLoadingAuthStatus || loading.value}
                link={{ href: "/resetpassword", text: "Forgot Password?" }}
                validate={false}
            />
            <LoadingButton
                class="w-full"
                label="Sign In"
                loading={loading.value}
                loadingLabel="Signing In"
                type="submit"
            />
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
