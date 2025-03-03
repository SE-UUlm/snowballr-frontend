<script lang="ts">
    import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        class: className,
        inset,
        ...restProps
    }: DropdownMenuPrimitive.GroupHeadingProps & {
        inset?: boolean;
    } = $props();
</script>

<DropdownMenuPrimitive.GroupHeading
    class={cn("text-default-sb px-2 py-1.5", inset && "pl-8", className)}
    bind:ref
    {...restProps}
/>
