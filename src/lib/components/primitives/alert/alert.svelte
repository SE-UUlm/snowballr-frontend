<script lang="ts" module>
    import { type VariantProps, tv } from "tailwind-variants";

    export const alertVariants = tv({
        base: "grid gap-0.5 rounded-lg border p-4 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 group/alert relative w-full",
        variants: {
            variant: {
                default: "bg-card text-card-foreground",
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
    import { cn, type WithElementRef } from "$lib/utils/shadcn-helper.js";
    import type { HTMLAttributes } from "svelte/elements";

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

<div
    bind:this={ref}
    class={cn(alertVariants({ variant }), className)}
    data-slot="alert"
    role="alert"
    {...restProps}
>
    {@render children?.()}
</div>
