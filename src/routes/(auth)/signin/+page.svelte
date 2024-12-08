<script lang="ts">
    import Input from "$lib/components/composites/input/Input.svelte";
    import PasswordInput from "$lib/components/composites/input/PasswordInput.svelte";
    import { Button } from "$lib/components/primitives/button/index.js";
    import * as Card from "$lib/components/primitives/card/index.js";

    let email = $state("");
    let password = $state("");

    function handleSubmit(event: Event) {
        event.preventDefault();

        // Don't validate the input fields as they only need to match data on the server
        const signInData = { email, password };
        // TODO: CALL API TO SIGN IN
        console.log("sign in with", signInData);
    }
</script>

<svelte:head>
    <title>Sign In</title>
</svelte:head>
<Card.Root class="flex flex-col w-full border-slate-500 shadow-lg max-w-xl">
    <Card.Header class="flex flex-col w-full">
        <Card.Title class="text-3xl">Sign In</Card.Title>
        <Card.Description>Enter your credentials below to sign in to your account</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col w-full">
        <form class="flex flex-col gap-5" onsubmit={handleSubmit}>
            <Input
                class="w-full"
                inputId="email"
                label="Email"
                placeholder="john.doe@example.com"
                required
                type="email"
                bind:value={email}
            />
            <PasswordInput class="w-full" showForgotPasswordLink bind:value={password} />
            <Button type="submit" class="w-full">Sign In</Button>
        </form>
        <div class="mt-4 text-center text-sm">
            You don't have an account?
            <a href="/signup" class="underline"> Sign Up </a>
        </div>
    </Card.Content>
</Card.Root>
