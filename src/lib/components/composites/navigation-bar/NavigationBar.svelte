<script lang="ts">
    import ArrowLeft from "@lucide/svelte/icons/arrow-left";
    import * as Card from "$lib/components/primitives/card/index.js";
    import * as Tabs from "$lib/components/primitives/tabs/index.js";
    import type { Snippet } from "svelte";
    import UserMenu from "./UserMenu.svelte";
    import type { LinkTab } from "$lib/model/tabs";
    import type { ResolvedPathname } from "$app/types";
    import Link from "$lib/components/composites/link/Link.svelte";

    interface Props {
        backRef?: ResolvedPathname | undefined;
        tabs?: LinkTab[] | undefined;
        defaultTabValue?: (typeof tabs)[number]["value"] | undefined;
        children?: Snippet | undefined;
    }

    const {
        backRef = undefined,
        tabs = [],
        defaultTabValue = "",
        children = undefined,
    }: Props = $props();
</script>

<!--
@component
A reusable navigation bar component to navigate to other pages and the user menu.

Usage:
```svelte
    <NavigationBar backref="/previous-page" defaultTabValue={0} {tabs}>
        <h2>This is a title!</h2>
    </NavigationBar>
```
-->
<header>
    <Card.Root class="w-fit shadow-lg">
        <nav class="grid h-18 grid-flow-col items-center gap-3 px-4 py-2">
            <UserMenu />
            {#if backRef !== undefined}
                <Link aria-label={`Back to ${backRef}`} href={backRef}>
                    <ArrowLeft class="size-6" />
                </Link>
            {/if}
            <!-- Children can be e.g. a title element -->
            {@render children?.()}
            {#if tabs.length > 0}
                <Tabs.Root value={defaultTabValue}>
                    <Tabs.List>
                        {#each tabs as tab (tab.value)}
                            <Tabs.Trigger href={tab.href} value={tab.value}>
                                <span>{tab.label}</span>
                            </Tabs.Trigger>
                        {/each}
                    </Tabs.List>
                </Tabs.Root>
            {/if}
        </nav>
    </Card.Root>
</header>
