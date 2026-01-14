<script lang="ts">
    import Input from "$lib/components/composites/input/Input.svelte";
    import PasswordInput from "$lib/components/composites/input/PasswordInput.svelte";
    import * as Card from "$lib/components/primitives/card/index.js";
    import { backendService } from "$lib/grpc-api";
    import { Schema } from "$lib/schemas";
    import { goto } from "$app/navigation";
    import { cn } from "$lib/utils/shadcn-helper";
    import LoadingButton from "$lib/components/composites/button/LoadingButton.svelte";
    import { loadingWrapper } from "$lib/utils/common-helper";
    import type { RpcError } from "@protobuf-ts/runtime-rpc";
    import { GrpcStatusCode } from "@protobuf-ts/grpcweb-transport";
    import { isGrpcError } from "$lib/utils/common-helper.js";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";
    import logo from "$lib/assets/snowballr-logo_512.png";
    import { addRedirectUrlIfExists, getRedirectUrlOrValue } from "$lib/utils/search-parameters";

    let emailInput: Input;
    let passwordInput: PasswordInput;

    let signInError: ActionError = $state(undefined);

    const loading = $state({ value: false });

    async function handleSubmit(event: Event) {
        event.preventDefault();
        signInError = undefined;

        if (!emailInput.validate()) return;

        const userData = {
            email: emailInput.getValue(),
            password: passwordInput.getValue(),
        };

        await backendService
            .login(userData)
            .then(async () => await goto(getRedirectUrlOrValue("/")))
            .catch((error: RpcError) => {
                if (isGrpcError(error.code, GrpcStatusCode.UNAUTHENTICATED)) {
                    signInError = createActionError(
                        "Invalid Credentials",
                        {
                            customDetails:
                                "The email or password you entered is incorrect. Please check your credentials or try resetting your password.",
                        },
                        error,
                    );
                } else {
                    signInError = createActionError(
                        "Sign In Failed",
                        { action: "signing you in" },
                        error,
                    );
                }
            });
    }
</script>

<svelte:head>
    <title>Sign In</title>
</svelte:head>

<Card.Root class={cn("flex w-full max-w-xl flex-col border-slate-500 shadow-lg")}>
    <Card.Header class="flex h-fit w-full flex-row">
        <img class="h-35 w-35" alt="SnowballR Logo" src={logo} />
        <div class="flex h-35 w-full flex-col justify-center">
            <Card.Title class="text-3xl">Sign In to SnowballR</Card.Title>
            <Card.Description>Enter your credentials to sign in to your account</Card.Description>
        </div>
    </Card.Header>
    <Card.Content class="flex w-full flex-col">
        <form
            class="flex flex-col gap-5"
            onsubmit={(args) => loadingWrapper(loading, handleSubmit, args)}
        >
            <Input
                bind:this={emailInput}
                class="w-full"
                disabled={loading.value}
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
                disabled={loading.value}
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
            <ActionErrorAlert error={signInError} />
        </form>
        <div class="mt-4 text-center text-sm">
            You don't have an account yet?
            <a class="underline" href={addRedirectUrlIfExists("/signup")}> Sign Up </a>
        </div>
    </Card.Content>
</Card.Root>
