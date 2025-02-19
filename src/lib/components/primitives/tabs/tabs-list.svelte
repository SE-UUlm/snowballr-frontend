<script lang="ts">
    import { Tabs as TabsPrimitive } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: TabsPrimitive.ListProps = $props();
</script>

<TabsPrimitive.List
    class={cn(
        "bg-muted text-muted-foreground inline-flex h-fit items-center justify-center rounded-md p-1.5",
        className,
    )}
    bind:ref
    {...restProps}
/>
