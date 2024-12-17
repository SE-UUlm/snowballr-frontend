<script lang="ts">
    import Eye from "lucide-svelte/icons/eye";
    import EyeClosed from "lucide-svelte/icons/eye-closed";
    import { Schema } from "$lib/schemas";
    import Input from "./Input.svelte";

    type Props = {
        class?: string;
        value?: string;
    };

    let { value = $bindable(), class: className = "", ...restProps }: Props = $props();
    let isPasswordVisible = $state(false);
    let input: Input;

    /**
     * Same as {@link Input.validate}.
     */
    export const validate = () => input.validate();

    /**
     * Same as {@link Input.getValue}.
     */
    export const getValue = () => input.getValue();
</script>

<!--
@component
Password Input Element.

Customized {@link Input} component for password input.

Usage:
```svelte
    <PasswordInput bind:value={password} bind:this={passwordInput} />
```
-->
<Input
    class={className}
    inputId="password-input"
    label="Password"
    required
    type={isPasswordVisible ? "text" : "password"}
    schema={Schema.password}
    onButtonClick={() => (isPasswordVisible = !isPasswordVisible)}
    buttonProps={{ "aria-label": "Toggle password visibility" }}
    bind:value
    bind:this={input}
    autocomplete={undefined}
    autocapitalize="off"
    autocorrect="off"
    {...restProps}
>
    {#snippet buttonContent()}
        {#if isPasswordVisible}
            <Eye />
        {:else}
            <EyeClosed />
        {/if}
    {/snippet}
</Input>
