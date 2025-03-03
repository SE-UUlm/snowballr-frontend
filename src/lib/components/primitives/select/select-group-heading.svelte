<script lang="ts">
    import { Select as SelectPrimitive } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: SelectPrimitive.GroupHeadingProps = $props();
</script>

<SelectPrimitive.GroupHeading
    class={cn("py-1.5 pr-2 pl-8 text-sm font-semibold", className)}
    bind:ref
    {...restProps}
/>
