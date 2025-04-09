<script lang="ts">
    import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
    import { buttonVariants } from "$lib/components/primitives/button/index.js";
    import { cn } from "$lib/utils/shadcn-helper.js";

    export type AlertDialogCancelProps = AlertDialogPrimitive.CancelProps;

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: AlertDialogCancelProps = $props();
</script>

<AlertDialogPrimitive.Cancel
    class={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
    bind:ref
    {...restProps}
/>
