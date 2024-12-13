<script lang="ts">
    import { Progress } from "$lib/components/primitives/progress";
    import { Skeleton } from "$lib/components/primitives/skeleton";
</script>

<div
    class="flex flex-col lg:flex-row h-fit w-full gap-3 lg:gap-10 items-start lg:items-center justify-between px-5 py-2 border border-container-border-grey rounded-md hover:bg-container-border-grey/35"
>
    <div class="flex flex-col h-fit w-full items-start gap-y-1">
        <Skeleton class="h-7 w-full max-w-[100px] rounded-full" />
        <Skeleton class="h-4 w-full max-w-[150px] rounded-full" />
    </div>
    <div
        class="flex flex-row w-full gap-x-5 lg:gap-x-2.5 items-center justify-start lg:justify-end"
    >
        <Skeleton class="h-4 w-full max-w-14 rounded-full" />
        <Progress class="h-2.5 w-full min-w-16 lg:max-w-32" value={0} />
    </div>
</div>
