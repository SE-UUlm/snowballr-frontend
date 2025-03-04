<script lang="ts">
    import { Skeleton } from "$lib/components/primitives/skeleton";
</script>

<div class="flex flex-row gap-x-4 p-5">
    <Skeleton class="h-[150px] w-[150px] rounded-full" />
    <ul class="mx-10 space-y-3">
        <li><Skeleton class="h-6 w-[300px] rounded-full" /></li>
        <li><Skeleton class="h-6 w-[300px] rounded-full" /></li>
        <li><Skeleton class="h-6 w-[300px] rounded-full" /></li>
        <li><Skeleton class="h-6 w-[300px] rounded-full" /></li>
    </ul>
</div>
