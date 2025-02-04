<script lang="ts">
    import Separator from "../../primitives/separator/separator.svelte";
    import type { IconLinkTab } from "$lib/model/tabs";
    import { cn } from "$lib/utils/shadcn-helper";
    import type { Snippet } from "svelte";

    interface Props {
        tabs: IconLinkTab[];
        selectedTab: (typeof tabs)[number]["value"];
        children?: Snippet | undefined;
    }

    const { tabs, selectedTab, children = undefined }: Props = $props();
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
<div
    class="flex h-full w-full flex-row gap-4 overflow-hidden px-0 py-2.5 md:px-[1.75rem] lg:px-[3.75rem]"
>
    <nav class="flex h-full w-full max-w-[20%] min-w-[9rem] flex-col gap-2.5 px-1.5 py-2.5">
        {#each tabs as tab}
            <a
                class={cn(
                    "flex h-12 w-full flex-row items-center gap-3 px-3",
                    tab.value === selectedTab ? "rounded-lg bg-slate-200" : "",
                )}
                data-testid={`settings-tab-${tab.value}`}
                href={tab.href}
            >
                <tab.icon class="size-4" />
                <span>{tab.label}</span>
            </a>
        {/each}
    </nav>
    <Separator orientation="vertical" />
    <main class="flex h-full w-full flex-col gap-3 overflow-y-auto p-2.5">
        {@render children?.()}
    </main>
</div>
