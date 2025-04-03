<script lang="ts">
    import { Skeleton } from "$lib/components/primitives/skeleton";
</script>

<!--
@component
Skeleton for `ProjectMemberListEntry`.
-->
<div class="flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
    <div class="flex flex-col gap-1">
        <Skeleton class="h-6 w-40 rounded-full" />
        <Skeleton class="h-5 w-52 rounded-full" />
    </div>
    <Skeleton class="h-7 w-40 rounded-full" />
</div>
