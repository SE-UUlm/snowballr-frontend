<script lang="ts">
    import { Skeleton } from "$lib/components/primitives/skeleton";
    import { cn } from "$lib/utils/shadcn-helper";

    interface Props {
        size?: "default" | "small";
    }

    const { size = "default" }: Props = $props();

    // The size of the user avatar is hardcoded and should never be changed
    // svelte-ignore state_referenced_locally
    const avatarSize = size === "default" ? "size-10" : "size-8";
</script>

<Skeleton class={cn(avatarSize, "rounded-full")} data-testid="user-avatar-skeleton" />
