<script lang="ts">
    import { Avatar as AvatarPrimitive } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: AvatarPrimitive.RootProps = $props();
</script>

<AvatarPrimitive.Root
    class={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full", className)}
    bind:ref
    {...restProps}
/>
