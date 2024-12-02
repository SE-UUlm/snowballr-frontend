<script lang="ts">
    import { Input } from "$lib/components/primitives/input/index.js";
    import { Label } from "$lib/components/primitives/label/index.js";
    import { cn } from "$lib/utils";
    import type { WithElementRef } from "bits-ui";
    import type { Snippet } from "svelte";
    import type {
        HTMLButtonAttributes,
        HTMLInputAttributes,
        HTMLInputTypeAttribute,
    } from "svelte/elements";
    import { z } from "zod";

    type Props = WithElementRef<HTMLInputAttributes> & {
        inputId: string;
        label: string;
        placeholder?: string;
        required: boolean;
        type: HTMLInputTypeAttribute;
        link?: { href: string; text: string };
        inputClass?: string;
        schema?: z.ZodFirstPartySchemaTypes;
        onButtonClick?: () => void;
        buttonContent?: Snippet;
        buttonProps?: HTMLButtonAttributes;
    };

    let {
        inputId,
        label,
        placeholder = "",
        required,
        type,
        link,
        inputClass = "",
        schema,
        onButtonClick,
        buttonContent,
        buttonProps,
        value = $bindable(),
        class: className,
        ...restProps
    }: Props = $props();

    let errorMessages = $state<string[]>([]);
    let isFirstValidation = $state(true);

    /**
     * Validates the input value against the provided schema and returns whether the input was valid.
     *
     * - If no schema is provided, this method always returns true
     *
     * @returns {boolean} True if the input value is valid, false otherwise.
     */
    export function validate(): boolean {
        if (!schema) {
            return true;
        }

        isFirstValidation = false;
        const parsedSchema = schema.safeParse(value);
        errorMessages = parsedSchema.error?.errors.map((error) => error.message) ?? [];
        return parsedSchema.success;
    }

    /**
     * Get the current value of the input.
     *
     * Same as binding the `value` prop.
     */
    export const getValue = () => value;

    /**
     * After the initial input was validated, validate the input on every input event.
     */
    function onInput() {
        if (!isFirstValidation) {
            validate();
        }
    }
</script>

<!--
@component
Highly customizable Input Element.

When binding the component using the `bind:this` directive, following methods are available:
- {@link validate} to validate the input value.
- {@link getValue} to get the current value of the input.

Customizations:
- Use `link` prop to add a link above the input field.
- Pass a `buttonContent` snippet to add a button to the right of the input field.
See {@link PasswordInput} for an example.

Usage:
```svelte
    <Input
        inputId="example-id"
        label="Example"
        placeholder="Example"
        required
        type="text"
        schema={myExampleSchema}
        bind:this={exampleInput}
        bind:value={exampleValue}
    />
```
-->
<div class={cn("flex flex-col gap-2", className)}>
    <div class="flex flex-row items-center justify-between">
        <Label for={inputId}>{label}</Label>
        {#if link}
            <a href={link.href} class="text-sm underline">
                {link.text}
            </a>
        {/if}
    </div>
    <div class="relative flex flex-row items-center">
        <Input
            id={inputId}
            {type}
            {placeholder}
            {required}
            class={cn(inputClass, buttonContent ? "pr-12" : "")}
            bind:value
            oninput={onInput}
            {...restProps}
        />
        {#if buttonContent}
            <button class="absolute right-4" onclick={onButtonClick} type="button" {...buttonProps}>
                {@render buttonContent()}
            </button>
        {/if}
    </div>
    {#each errorMessages as errorMessage}
        <p class="text-sm text-red-500">{errorMessage}</p>
    {/each}
</div>
