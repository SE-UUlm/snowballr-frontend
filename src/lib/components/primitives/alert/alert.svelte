<script lang="ts" module>
    import { type VariantProps, tv } from "tailwind-variants";

    export const alertVariants = tv({
        base: "[&>svg]:text-foreground relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7",
        variants: {
            variant: {
                default: "bg-background text-foreground",
                success: "border-success/50 text-success dark:border-success [&>svg]:text-success",
                info: "border-info/50 text-info dark:border-info [&>svg]:text-info",
                warning: "border-warning/50 text-warning dark:border-warning [&>svg]:text-warning",
                error: "border-error/50 text-error dark:border-error [&>svg]:text-error",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    });

    export type AlertVariant = VariantProps<typeof alertVariants>["variant"];
</script>

<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import type { WithElementRef } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        class: className,
        variant = "default",
        children,
        ...restProps
    }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
        variant?: AlertVariant;
    } = $props();
</script>

<div bind:this={ref} class={cn(alertVariants({ variant }), className)} {...restProps} role="alert">
    {@render children?.()}
</div>
