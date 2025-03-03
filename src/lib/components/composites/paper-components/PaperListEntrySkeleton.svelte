<script lang="ts">
    import { Skeleton } from "$lib/components/primitives/skeleton";
    import UserAvatarSkeleton from "../user-avatar/UserAvatarSkeleton.svelte";

    // IMPORTANT: overwrite this property only for testing purpose
    const { isSkeletonWithReview = Math.random() < 0.25 } = $props();
</script>

<div
    class="border-container-border-grey highlight-on-hover flex w-full flex-row items-center justify-end gap-3 rounded-md border pe-3"
>
    <div class="flex flex-auto rounded-md border-l-4 px-3 py-1.5">
        <div class="grid w-10/12 grid-flow-row gap-1">
            <div class="flex flex-row items-center gap-1">
                <Skeleton class="h-5 w-8 rounded-full" data-testid="paper-id-skeleton" />
                <Skeleton class="h-6 w-full rounded-full" data-testid="paper-title-skeleton" />
            </div>
            <div class="flex flex-row">
                <Skeleton class="h-5 w-8/12 rounded-full" data-testid="authors-skeleton" />
            </div>
        </div>
    </div>
    {#if isSkeletonWithReview}
        <UserAvatarSkeleton />
    {/if}
</div>
