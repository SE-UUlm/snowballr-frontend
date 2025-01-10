<script lang="ts">
    import type { Separator as SeparatorPrimitive } from "bits-ui";
    import { Separator } from "$lib/components/primitives/separator/index.js";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: SeparatorPrimitive.RootProps = $props();
</script>

<Separator class={cn("bg-muted -mx-1 my-1 h-px", className)} bind:ref {...restProps} />
