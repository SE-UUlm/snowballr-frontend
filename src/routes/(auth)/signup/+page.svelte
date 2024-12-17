<script lang="ts">
    import Input from "$lib/components/composites/input/Input.svelte";
    import PasswordInput from "$lib/components/composites/input/PasswordInput.svelte";
    import { Button } from "$lib/components/primitives/button/index.js";
    import * as Card from "$lib/components/primitives/card/index.js";
    import { BackendController } from "$lib/controller/backend-controller";
    import type { UserSpec } from "$lib/model/backend";
    import { Schema } from "$lib/schemas";

    let firstNameInput: Input;
    let lastNameInput: Input;
    let emailInput: Input;
    let passwordInput: PasswordInput;

    async function handleSubmit(event: Event) {
        event.preventDefault();

        const isFirstNameValid = firstNameInput.validate();
        const isLastNameValid = lastNameInput.validate();
        const isEmailValid = emailInput.validate();
        const isPasswordValid = passwordInput.validate();
        if (!(isFirstNameValid && isLastNameValid && isEmailValid && isPasswordValid)) {
            return;
        }

        const userSpec: UserSpec = {
            firstName: firstNameInput.getValue(),
            lastName: lastNameInput.getValue(),
            email: emailInput.getValue(),
        };
        const user = await BackendController.getInstance().createUser(
            userSpec,
            passwordInput.getValue(),
        );
        // TODO: Login and redirect to the home page
        console.log(user);
    }
</script>

<svelte:head>
    <title>Sign Up</title>
</svelte:head>
<Card.Root class="flex flex-col w-full border-slate-500 shadow-lg max-w-xl">
    <Card.Header class="flex flex-col w-full">
        <Card.Title class="text-3xl">Sign Up</Card.Title>
        <Card.Description>Enter your information to create an account</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col w-full">
        <form class="flex flex-col gap-5" onsubmit={handleSubmit}>
            <div class="flex flex-row gap-5 w-full">
                <Input
                    class="w-full"
                    inputId="first-name-input"
                    label="First Name"
                    placeholder="John"
                    required
                    type="text"
                    schema={Schema.firstName}
                    bind:this={firstNameInput}
                />
                <Input
                    class="w-full"
                    inputId="last-name-input"
                    label="Last Name"
                    placeholder="Doe"
                    required
                    type="text"
                    schema={Schema.lastName}
                    bind:this={lastNameInput}
                />
            </div>
            <Input
                class="w-full"
                inputId="email-input"
                label="Email"
                placeholder="john.doe@example.com"
                required
                type="email"
                schema={Schema.email}
                bind:this={emailInput}
            />
            <PasswordInput class="w-full" bind:this={passwordInput} />
            <Button type="submit" class="w-full">Create an account</Button>
        </form>
        <div class="mt-4 text-center text-sm">
            Already have an account?
            <a href="/signin" class="underline"> Sign In </a>
        </div>
    </Card.Content>
</Card.Root>
