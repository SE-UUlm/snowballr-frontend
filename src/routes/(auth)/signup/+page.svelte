<script lang="ts">
    import Input from "$lib/components/composites/input/Input.svelte";
    import PasswordInput from "$lib/components/composites/input/PasswordInput.svelte";
    import { Button } from "$lib/components/primitives/button/index.js";
    import * as Card from "$lib/components/primitives/card/index.js";
    import { Schema } from "$lib/schemas";

    let firstNameInput: Input;
    let lastNameInput: Input;
    let emailInput: Input;
    let passwordInput: PasswordInput;

    function handleSubmit(event: Event) {
        event.preventDefault();

        const areInputsValid =
            firstNameInput.validate() &&
            lastNameInput.validate() &&
            emailInput.validate() &&
            passwordInput.validate();
        if (!areInputsValid) {
            return;
        }

        const signUpData = {
            firstName: firstNameInput.getValue(),
            lastName: lastNameInput.getValue(),
            email: emailInput.getValue(),
            password: passwordInput.getValue(),
        };
        // TODO: CALL API TO SIGN UP
        console.log("sign up with", signUpData);
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
                    inputId="first-name"
                    label="First Name"
                    placeholder="John"
                    required
                    type="text"
                    schema={Schema.firstName}
                    bind:this={firstNameInput}
                />
                <Input
                    class="w-full"
                    inputId="last-name"
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
                inputId="email"
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
