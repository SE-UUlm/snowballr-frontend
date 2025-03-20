<script lang="ts">
    import { Skeleton } from "$lib/components/primitives/skeleton";
    import UserAvatarSkeleton from "../user-avatar/UserAvatarSkeleton.svelte";
    import { reviewMode } from "$lib/global-state/review-mode-state.svelte";

    interface Props {
        numberOfReviews?: number;
    }

    let { numberOfReviews = 0 }: Props = $props();
</script>

<li class="flex flex-row items-center gap-4">
    {#if reviewMode.isActivated}
        <div class="size-4.5"></div>
    {/if}
    <div class="flex flex-row gap-2 py-0.5">
        <Skeleton class="h-5 w-6 rounded-full" />
        <Skeleton class="h-5 w-32 rounded-full" />
        <Skeleton class="h-5 w-6 rounded-full" />
    </div>
    {#if !reviewMode.isActivated}
        {#each { length: numberOfReviews }}
            <UserAvatarSkeleton size="small" />
        {/each}
    {/if}
</li>
