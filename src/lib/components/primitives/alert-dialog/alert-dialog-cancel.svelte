<script lang="ts">
    import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
    import {
        buttonVariants,
        type ButtonVariant,
        type ButtonSize,
    } from "$lib/components/primitives/button/index.js";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        class: className,
        variant = "outline",
        size = "default",
        ...restProps
    }: AlertDialogPrimitive.CancelProps & {
        variant?: ButtonVariant;
        size?: ButtonSize;
    } = $props();
</script>

<AlertDialogPrimitive.Cancel
    class={cn(buttonVariants({ variant, size }), "", className)}
    data-slot="alert-dialog-cancel"
    bind:ref
    {...restProps}
/>
