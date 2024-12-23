<script lang="ts">
    import { cn } from "$lib/utils/shadcn-helper";
    import CircleCheck from "lucide-svelte/icons/circle-check";
    import CircleAlert from "lucide-svelte/icons/circle-alert";
    import type { WithElementRef } from "bits-ui";
    import type { HTMLAttributes } from "svelte/elements";

    type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
        isValid: boolean;
        description: string;
    };

    let { isValid, description, class: className, ...restProps }: Props = $props();

    const prettyDescription = description.substring(0, 1).toUpperCase() + description.substring(1);
</script>

<!--
@component
Input Validation Criterion Element used to display the validation status of an input.

Usage:
```svelte
    <InputValidationCriterion {isValid} description="At least one character" />
```
-->
<div
    class={cn(
        "flex flex-row gap-2 w-full px-0.5 py-0.5 text-sm items-start",
        isValid ? "text-green-500" : "text-red-500",
        className,
    )}
    {...restProps}
>
    <div>
        {#if isValid}
            <CircleCheck class="w-5 h-5" data-testid="validation-success" />
        {:else}
            <CircleAlert class="w-5 h-5" data-testid="validation-fail" />
        {/if}
    </div>
    <p class="wrap">{prettyDescription}</p>
</div>
