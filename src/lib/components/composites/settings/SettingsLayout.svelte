<script lang="ts">
    import Separator from "../../primitives/separator/separator.svelte";
    import type { IconLinkTab } from "$lib/model/tabs";
    import { cn } from "$lib/utils/shadcn-helper";
    import type { Snippet } from "svelte";
    import ScrollArea from "$lib/components/primitives/scroll-area/scroll-area.svelte";

    interface Props {
        tabs: IconLinkTab[];
        selectedTab: (typeof tabs)[number]["value"];
        children?: Snippet | undefined;
        allScrollable?: boolean;
    }

    const { tabs, selectedTab, children = undefined, allScrollable = true }: Props = $props();
</script>

<!--
@component
A generic settings layout with a list of settings pages on the left, with the current highlighted
and the settings content on the right side. The content i.e. the children of this component are
scrollable, while the list on the left stays fixed.

See `ProjectSettingsLayout` for an example.

Usage:
```svelte
    <SettingsLayout
        tabs={[
            {
                value: "users",
                label: "Users",
                href: "/users",
                icon: Users,
            },
            {
                value: "general",
                label: "General",
                href: "/general",
                icon: Settings,
            },
        ]}
        selectedTab="users"
    >
        {@render children?.()}
    </SettingsLayout>
```
-->

{#snippet content()}
    <main class={cn("flex h-full w-full flex-col gap-3 p-2.5", allScrollable ? "" : "")}>
        {@render children?.()}
    </main>
{/snippet}

<div class="flex h-full w-full flex-row gap-4 overflow-hidden px-0 py-2.5 md:px-7 lg:px-15">
    <nav class="flex h-full w-full max-w-[20%] min-w-36 flex-col gap-2.5 px-1.5 py-2.5">
        {#each tabs as tab, i (i)}
            <!-- see https://github.com/sveltejs/eslint-plugin-svelte/issues/1319 -->
            <!-- eslint-disable svelte/no-navigation-without-resolve -->
            <a
                class={cn(
                    "flex h-12 w-full flex-row items-center gap-3 px-3",
                    tab.value === selectedTab ? "rounded-lg bg-slate-200" : "",
                )}
                data-testid={`settings-tab-${tab.value}`}
                href={tab.href}
            >
                <!-- eslint-enable svelte/no-navigation-without-resolve -->
                <tab.icon class="size-4" />
                <span>{tab.label}</span>
            </a>
        {/each}
    </nav>
    <Separator orientation="vertical" />
    {#if allScrollable}
        <ScrollArea class="overflow-hidden">
            {@render content()}
        </ScrollArea>
    {:else}
        {@render content()}
    {/if}
</div>
