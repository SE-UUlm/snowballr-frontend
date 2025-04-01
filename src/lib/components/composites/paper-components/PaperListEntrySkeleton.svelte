<script lang="ts">
    import UserAvatarSkeleton from "../user-avatar/UserAvatarSkeleton.svelte";
    import PaperInfoSkeleton from "$lib/components/composites/paper-components/PaperInfoSkeleton.svelte";

    // IMPORTANT: overwrite this property only for testing purpose
    const { isSkeletonWithReview = Math.random() < 0.25 } = $props();
</script>

<div
    class="border-container-border-grey highlight-on-hover flex w-full flex-row items-center justify-end gap-3 rounded-md border pe-3"
>
    <div class="flex flex-auto rounded-md border-l-4 px-3 py-1.5">
        <div class="grid w-10/12 grid-flow-row gap-1">
            <PaperInfoSkeleton />
        </div>
    </div>
    {#if isSkeletonWithReview}
        <UserAvatarSkeleton />
    {/if}
</div>
