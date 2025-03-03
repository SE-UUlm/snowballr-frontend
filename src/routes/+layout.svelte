<script lang="ts">
    import { cn } from "$lib/utils/shadcn-helper";
    import { env } from "$env/dynamic/public";
    import "../app.css";

    let { children } = $props();

    const isDevMode = env.PUBLIC_IS_DEV_MODE === "true";

    if (isDevMode) {
        console.warn("Running in development mode");
    }
</script>

<div class="flex h-screen w-screen flex-col items-start gap-4 p-4">
    {@render children()}
</div>
{#if isDevMode}
    <div
        class={cn(
            "absolute right-1 bottom-1 rounded-md px-1.5",
            "bg-red-300 sm:bg-green-300 md:bg-yellow-300 lg:bg-blue-300 xl:bg-purple-300 2xl:bg-pink-300",
        )}
    >
        <div class="max-sm:visible sm:hidden">--</div>
        <div class="max-sm:hidden sm:visible md:hidden">sm</div>
        <div class="max-md:hidden md:visible lg:hidden">md</div>
        <div class="max-lg:hidden lg:visible xl:hidden">lg</div>
        <div class="max-xl:hidden xl:visible 2xl:hidden">xl</div>
        <div class="max-2xl:hidden 2xl:visible">2xl</div>
    </div>
{/if}
