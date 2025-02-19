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
    bind:this={input}
    class={className}
    autocapitalize="off"
    autocomplete={undefined}
    autocorrect="off"
    buttonProps={{ "aria-label": "Toggle password visibility" }}
    errorMessagePrefix="Password must contain"
    inputId="password-input"
    label="Password"
    onButtonClick={() => (isPasswordVisible = !isPasswordVisible)}
    required
    schema={Schema.password}
    type={isPasswordVisible ? "text" : "password"}
    validationDisplayMode="constant"
    bind:value
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
