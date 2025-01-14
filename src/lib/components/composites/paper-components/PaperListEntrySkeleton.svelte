<script lang="ts">
    import { Skeleton } from "$lib/components/primitives/skeleton";

    // IMPORTANT: overwrite this property only for testing purpose
    const { isSkeletonWithReview = Math.random() < 0.25 } = $props();
</script>

<div
    class="flex flex-row items-center justify-end pe-3 gap-3 w-full border border-container-border-grey rounded-md highlight-on-hover"
>
    <div class="flex flex-auto border-l-4 rounded-md px-3 py-1.5">
        <div class="grid grid-flow-row w-10/12 gap-1">
            <div class="flex flex-row gap-1 items-center">
                <Skeleton class="h-5 w-8 rounded-full" data-testid="paper-id-skeleton" />
                <Skeleton class="h-6 w-full rounded-full" data-testid="paper-title-skeleton" />
            </div>
            <div class="flex flex-row">
                <Skeleton class="h-5 w-8/12 rounded-full" data-testid="authors-skeleton" />
            </div>
        </div>
    </div>
    {#if isSkeletonWithReview}
        <Skeleton class="size-10 rounded-full" data-testid="user-avatar-skeleton" />
    {/if}
</div>
