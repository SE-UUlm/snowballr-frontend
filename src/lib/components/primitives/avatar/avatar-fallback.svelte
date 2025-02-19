<script lang="ts">
    import { Avatar as AvatarPrimitive } from "bits-ui";
    import { cn } from "$lib/utils/shadcn-helper.js";

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: AvatarPrimitive.FallbackProps = $props();
</script>

<AvatarPrimitive.Fallback
    class={cn("bg-muted flex h-full w-full items-center justify-center rounded-full", className)}
    bind:ref
    {...restProps}
/>
