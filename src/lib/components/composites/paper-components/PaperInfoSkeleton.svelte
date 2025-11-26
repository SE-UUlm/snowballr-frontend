<script lang="ts">
    import { Skeleton } from "$lib/components/primitives/skeleton/index.js";
</script>

<div class="grid grid-flow-row gap-1.5">
    <div class="flex flex-row items-center gap-1">
        <Skeleton class="h-5 w-8 rounded-full" data-testid="paper-id-skeleton" />
        <Skeleton
            class="xl: h-6 w-30 rounded-full sm:w-40 md:w-50 lg:w-60 xl:w-80 2xl:w-100"
            data-testid="paper-title-skeleton"
        />
    </div>
    <Skeleton class="h-4.5 w-15 rounded-full sm:w-20 md:w-25 lg:w-30 xl:w-40 2xl:w-50" />
</div>
