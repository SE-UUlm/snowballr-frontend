<script lang="ts">
    import { Input } from "$lib/components/primitives/input/index.js";
    import { Label } from "$lib/components/primitives/label/index.js";
    import { cn } from "$lib/utils/shadcn-helper";
    import type { WithElementRef } from "bits-ui";
    import { onMount, type Snippet } from "svelte";
    import type {
        HTMLButtonAttributes,
        HTMLInputAttributes,
        HTMLInputTypeAttribute,
    } from "svelte/elements";
    import { z } from "zod";
    import InputValidationCriterion from "./InputValidationCriterion.svelte";
    import type { ResolvedPathname } from "$app/types";
    import Link from "$lib/components/composites/link/Link.svelte";

    export type InputProps = WithElementRef<HTMLInputAttributes> & {
        inputId: string;
        label?: string;
        placeholder?: string;
        required: boolean;
        type: HTMLInputTypeAttribute;
        link?: { href: ResolvedPathname; text: string };
        inputClass?: string;
        schema?: z.ZodType;
        onButtonClick?: () => void;
        buttonContent?: Snippet;
        buttonProps?: HTMLButtonAttributes;
        errorMessagePrefix?: string;
        validationDisplayMode?: "constant" | "onError";
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
        errorMessagePrefix = "",
        validationDisplayMode = "onError",
        value = $bindable(),
        class: className,
        ...restProps
    }: InputProps = $props();

    interface ValidationCriterion {
        code: string;
        subCode?: string;
        isMet: boolean;
        message: string;
    }

    let validationCriteria: ValidationCriterion[] = $state([]);
    /**
     * Initialize the validation criteria with an empty input.
     * This dynamically creates the validation criteria based on the schema.
     */
    function initValidationCriteria() {
        if (!schema || validationDisplayMode === "onError") {
            return;
        }

        const parsedSchema = schema.safeParse("");
        validationCriteria = issuesToCriteria(parsedSchema.error?.issues ?? []);
    }

    function issuesToCriteria(issues: z.core.$ZodIssue[]): ValidationCriterion[] {
        return issues.map((issue) => {
            const code = issue.code;
            const subCode =
                "params" in issue && issue.params !== undefined
                    ? issue.params["subCode"]
                    : undefined;
            return { code, subCode, isMet: false, message: issue.message };
        });
    }

    function doesIssueMatchCriterion(
        criterion: ValidationCriterion,
        issue: z.core.$ZodIssue,
    ): boolean {
        if (criterion.code !== issue.code) {
            return false;
        }

        let subCode: string | undefined;
        if ("params" in issue && issue.params !== undefined) {
            subCode = issue.params["subCode"];
        }

        return criterion.subCode === subCode;
    }

    // Track whether the first validation and input was made to provide UI feedback
    let isFirstValidation = $state(true);
    let isFirstInput = $state(true);
    let isValid = $state(true);

    /**
     * Validates the input value against the provided schema.
     *
     * - If no schema is provided, this method always returns true
     *
     * @returns True if the input value conforms to the schema, false otherwise.
     */
    export function validate(): boolean {
        if (!schema) {
            return true;
        }

        if (isFirstValidation) {
            isFirstValidation = false;
        }

        const parsedSchema = schema.safeParse(value);
        // Either update the criteria or recreate them based on the validation display mode
        if (validationDisplayMode === "constant") {
            let hasAtLeastOneError = false;
            validationCriteria = validationCriteria.map((criterion) => {
                // If no error is found, the criterion is met
                const isMet =
                    parsedSchema.error?.issues.find((issue) =>
                        doesIssueMatchCriterion(criterion, issue),
                    ) === undefined;

                hasAtLeastOneError = hasAtLeastOneError || !isMet;
                return { ...criterion, isMet };
            });
            isValid = !hasAtLeastOneError;
        } else {
            validationCriteria = issuesToCriteria(parsedSchema.error?.issues ?? []);
            isValid = validationCriteria.length === 0;
        }

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
     * This has the reason that it would bother the user if the input is validated on every input event
     * before they even had the chance to enter a valid value.
     */
    function onInput() {
        if (isFirstInput) {
            isFirstInput = false;
        }

        if (!isFirstValidation || validationDisplayMode === "constant") {
            validate();
        }
    }

    onMount(() => {
        initValidationCriteria();
    });

    // Border color is red if the input is invalid and not the first input
    // This provides instant feedback on the first input
    let borderColor = $derived(!isValid && !isFirstInput ? "border-red-500" : "");

    const criterionSelector = (criterion: ValidationCriterion) =>
        `${criterion.code}${criterion.subCode ? "-" + criterion.subCode : ""}`;
</script>

<!--
@component
Highly customizable Input Element.

When binding the component using the `bind:this` directive, following methods are available:
- {@link validate} to validate the input value.
- {@link getValue} to get the current value of the input.

As soon as `validate` initially, the input will be validated on every input event to provide instant feedback.

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
        errorMessagePrefix="Example must contain"
        validationDisplayMode="constant"
        bind:this={exampleInput}
        bind:value={exampleValue}
    />
```
-->
<div class={cn("flex flex-col gap-2", className)}>
    {#if label || link}
        <div class="flex flex-row items-center justify-between">
            {#if label}
                <Label for={inputId}>{label}</Label>
            {/if}
            {#if link}
                <Link class="text-sm underline" href={link.href}>
                    {link.text}
                </Link>
            {/if}
        </div>
    {/if}
    <div class="relative flex flex-row items-center">
        <Input
            id={inputId}
            class={cn(inputClass, buttonContent ? "pr-12" : "", borderColor)}
            oninput={onInput}
            {placeholder}
            {required}
            {type}
            bind:value
            {...restProps}
        />
        {#if buttonContent}
            <button class="absolute right-4" onclick={onButtonClick} type="button" {...buttonProps}>
                {@render buttonContent()}
            </button>
        {/if}
    </div>
    <!-- Display error messages either as constant checks or as list while on validation error -->
    {#if validationDisplayMode === "onError"}
        {#each validationCriteria.filter((criterion) => !criterion.isMet) as criterion (criterionSelector(criterion))}
            <p class="text-sm text-red-500" data-testid="error-message">
                {errorMessagePrefix}
                {criterion.message}
            </p>
        {/each}
    {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2">
            {#each validationCriteria as criterion, i (criterionSelector(criterion))}
                <InputValidationCriterion
                    class={i === validationCriteria.length - 1 ? "col-span-2" : ""}
                    data-testid="validation-criterion"
                    description={criterion.message}
                    isValid={criterion.isMet}
                />
            {/each}
        </div>
    {/if}
</div>
