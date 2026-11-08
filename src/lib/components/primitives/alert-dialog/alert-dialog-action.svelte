<script lang="ts">
    import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
    import {
        buttonVariants,
        type ButtonVariant,
        type ButtonSize,
    } from "$lib/components/primitives/button/index.js";
    import { cn } from "$lib/utils/shadcn-helper.js";

    export type AlertDialogActionProps = AlertDialogPrimitive.ActionProps & {
        variant?: ButtonVariant;
        size?: ButtonSize;
    };

    let {
        ref = $bindable(null),
        class: className,
        variant = "default",
        size = "default",
        ...restProps
    }: AlertDialogActionProps = $props();
</script>

<AlertDialogPrimitive.Action
    class={cn(buttonVariants({ variant, size }), "", className)}
    data-slot="alert-dialog-action"
    bind:ref
    {...restProps}
/>
