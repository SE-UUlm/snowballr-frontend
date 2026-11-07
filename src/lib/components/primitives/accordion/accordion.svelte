<script lang="ts">
    import { Accordion as AccordionPrimitive } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        value = $bindable(),
        class: className,
        ...restProps
    }: AccordionPrimitive.RootProps = $props();
</script>

<AccordionPrimitive.Root
    class={cn("flex w-full flex-col", className)}
    data-slot="accordion"
    bind:ref
    bind:value={value as never}
    {...restProps}
/>
