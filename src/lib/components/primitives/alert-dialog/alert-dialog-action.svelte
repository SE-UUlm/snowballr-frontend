<script lang="ts">
    import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
    import {
        buttonVariants,
        type ButtonSize,
        type ButtonVariant,
    } from "$lib/components/primitives/button/index.js";
    import { cn } from "$lib/utils/shadcn-helper.js";

    export type AlertDialogActionProps = AlertDialogPrimitive.ActionProps & {
        variant?: ButtonVariant;
        size?: ButtonSize;
    };

    let {
        variant = "default",
        size = "default",
        ref = $bindable(null),
        class: className,
        ...restProps
    }: AlertDialogActionProps = $props();
</script>

<AlertDialogPrimitive.Action
    class={cn(buttonVariants({ variant, size }), className)}
    bind:ref
    {...restProps}
/>
