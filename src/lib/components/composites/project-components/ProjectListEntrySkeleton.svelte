<script lang="ts">
    import { Progress } from "$lib/components/primitives/progress";
    import { Skeleton } from "$lib/components/primitives/skeleton";
</script>

<div
    class="border-container-border-grey hover:bg-container-border-grey/35 flex h-fit w-full flex-col items-start justify-between gap-3 rounded-md border px-5 py-2 lg:flex-row lg:items-center lg:gap-10"
>
    <div class="flex h-fit w-full flex-col items-start gap-y-1">
        <Skeleton
            class="h-7 w-full max-w-[100px] rounded-full"
            data-testid="project-name-skeleton"
        />
        <Skeleton
            class="h-4 w-full max-w-[150px] rounded-full"
            data-testid="project-members-skeleton"
        />
    </div>
    <div
        class="flex w-full flex-row items-center justify-start gap-x-5 lg:justify-end lg:gap-x-2.5"
    >
        <Skeleton class="h-4 w-full max-w-14 rounded-full" data-testid="project-stage-skeleton" />
        <Progress
            class="h-2.5 w-full min-w-16 lg:max-w-32"
            data-testid="project-stage-progress"
            value={0}
        />
    </div>
</div>
