<script lang="ts">
    import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
    import {
        buttonVariants,
        type ButtonVariant,
        type ButtonSize,
    } from "$lib/components/primitives/button/index.js";
    import { cn } from "$lib/utils/shadcn-helper.js";

    export type AlertDialogCancelProps = AlertDialogPrimitive.CancelProps & {
        variant?: ButtonVariant;
        size?: ButtonSize;
    };

    let {
        ref = $bindable(null),
        class: className,
        variant = "outline",
        size = "default",
        ...restProps
    }: AlertDialogCancelProps = $props();
</script>

<AlertDialogPrimitive.Cancel
    class={cn(buttonVariants({ variant, size }), "", className)}
    data-slot="alert-dialog-cancel"
    bind:ref
    {...restProps}
/>
