<script lang="ts">
    import { Skeleton } from "$lib/components/primitives/skeleton";
    import UserAvatarSkeleton from "../user-avatar/UserAvatarSkeleton.svelte";

    interface Props {
        inReviewMode: boolean;
        numberOfReviews?: number;
    }

    let { inReviewMode, numberOfReviews = 0 }: Props = $props();
</script>

<li class="flex flex-row gap-4 items-center">
    {#if inReviewMode}
        <div class="size-4.5"></div>
    {/if}
    <div class="flex flex-row gap-2 py-0.5">
        <Skeleton class="h-5 w-6 rounded-full" />
        <Skeleton class="h-5 w-32 rounded-full" />
        <Skeleton class="h-5 w-6 rounded-full" />
    </div>
    {#if !inReviewMode}
        {#each { length: numberOfReviews }}
            <UserAvatarSkeleton size="small" />
        {/each}
    {/if}
</li>
