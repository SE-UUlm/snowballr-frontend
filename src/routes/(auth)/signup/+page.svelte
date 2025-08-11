<script lang="ts">
    import Input from "$lib/components/composites/input/Input.svelte";
    import PasswordInput from "$lib/components/composites/input/PasswordInput.svelte";
    import * as Card from "$lib/components/primitives/card/index.js";
    import { backendService } from "$lib/grpc-api";
    import { Schema } from "$lib/schemas";
    import type { ApiError } from "$lib/model/general";
    import { goto } from "$app/navigation";
    import { cn } from "$lib/utils/shadcn-helper";
    import Alert from "$lib/components/composites/utils/Alert.svelte";
    import { loadingWrapper } from "$lib/utils/common-helper";
    import LoadingButton from "$lib/components/composites/button/LoadingButton.svelte";
    import { toast } from "svelte-sonner";
    import { GrpcStatusCode } from "@protobuf-ts/grpcweb-transport";
    import type { RpcError } from "@protobuf-ts/runtime-rpc";

    let firstNameInput: Input;
    let lastNameInput: Input;
    let emailInput: Input;
    let passwordInput: PasswordInput;

    let registrationError: ApiError | undefined = $state(undefined);

    const loading = $state({ value: false });

    async function handleSubmit(event: Event) {
        event.preventDefault();
        registrationError = undefined;

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
                errorTitle: "Invalid Input",
                errorDetails: `The input "${failedInput}" is not valid. Please check and try again.`,
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
            .then(async () => {
                toast.info("Registration successful!", {
                    description:
                        "You will receive a verification email shortly. Please check your inbox and follow the instructions to verify your account.",
                });
                await goto("/signin");
            })
            .catch((error: RpcError) => {
                const errorCodeValue = GrpcStatusCode[error.code as keyof typeof GrpcStatusCode];
                if (errorCodeValue === GrpcStatusCode.ALREADY_EXISTS) {
                    registrationError = {
                        errorTitle: "Email Already Registered",
                        errorDetails:
                            "An account with this email address already exists. Try logging in or resetting your password.",
                    };
                } else {
                    registrationError = {
                        errorTitle: "Registration Failed",
                        errorDetails:
                            "Something went wrong during registration. Please make sure your internet connection is stable, then try again.",
                    };
                }
                console.error(error);
            });
    }
</script>

<svelte:head>
    <title>Sign Up</title>
</svelte:head>

<Card.Root class={cn("flex w-full max-w-xl flex-col border-slate-500 shadow-lg")}>
    <Card.Header class="flex w-full flex-col">
        <Card.Title class="text-3xl">Sign Up</Card.Title>
        <Card.Description>Enter your information to create an account</Card.Description>
    </Card.Header>
    <Card.Content class="flex w-full flex-col">
        <form
            class="flex flex-col gap-5"
            onsubmit={(args) => loadingWrapper(loading, handleSubmit, args)}
        >
            <div class="flex w-full flex-row gap-5">
                <Input
                    bind:this={firstNameInput}
                    class="w-full"
                    disabled={loading.value}
                    errorMessagePrefix="First name"
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
                    disabled={loading.value}
                    errorMessagePrefix="Last name"
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
                disabled={loading.value}
                errorMessagePrefix="Email must have"
                inputId="email-input"
                label="Email"
                placeholder="john.doe@example.com"
                required
                schema={Schema.email}
                type="email"
            />
            <PasswordInput bind:this={passwordInput} class="w-full" disabled={loading.value} />
            <LoadingButton
                class="w-full"
                label="Create an account"
                loading={loading.value}
                loadingLabel="Creating an account"
                type="submit"
            />
            {#if registrationError}
                <Alert
                    details={registrationError.errorDetails}
                    title={registrationError.errorTitle}
                    variant="error"
                />
            {/if}
        </form>
        <div class="mt-4 text-center text-sm">
            Already have an account?
            <a class="underline" href="/signin"> Sign In </a>
        </div>
    </Card.Content>
</Card.Root>
