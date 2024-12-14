<script lang="ts">
    import Input from "$lib/components/composites/input/Input.svelte";
    import PasswordInput from "$lib/components/composites/input/PasswordInput.svelte";
    import { Button } from "$lib/components/primitives/button/index.js";
    import * as Card from "$lib/components/primitives/card/index.js";
    import { BackendController } from "$lib/controller/backend-controller";
    import CircleAlert from "lucide-svelte/icons/circle-alert";
    import * as Alert from "$lib/components/primitives/alert/index.js";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";
    import { goto } from "$app/navigation";
    import { getCurrentUser } from "$lib/current-user";

    let email = $state("");
    let password = $state("");
    let error = $state<string | undefined>(undefined);
    let loading = $state(false);
    const user = getCurrentUser();

    async function handleSubmit(event: Event) {
        event.preventDefault();

        error = undefined;
        loading = true;
        await BackendController.getInstance()
            .signIn(email, password)
            .then(() => {
                goto("/");
            })
            .catch((signInError) => {
                error = signInError.message;
            });
        loading = false;
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
    <Card.Content class="flex flex-col w-full gap-4">
        {#if user}
            <Alert.Root variant="default">
                <CircleAlert class="size-4" />
                <Alert.Title>Already Signed In</Alert.Title>
                <Alert.Description>
                    Do you want to preceed to the <a href="/" class="underline">Home Page</a>?
                </Alert.Description>
            </Alert.Root>
        {/if}
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
            {#if loading}
                <Button type="submit" class="w-full" disabled>
                    <LoaderCircle class="animate-spin" />
                    Signing In
                </Button>
            {:else}
                <Button type="submit" class="w-full">Sign In</Button>
            {/if}
        </form>
        <div class="text-center text-sm">
            You don't have an account?
            <a href="/signup" class="underline"> Sign Up </a>
        </div>
        {#if error}
            <Alert.Root variant="destructive">
                <CircleAlert class="size-4" />
                <Alert.Title>Error</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
            </Alert.Root>
        {/if}
    </Card.Content>
</Card.Root>
