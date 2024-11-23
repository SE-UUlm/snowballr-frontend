<script lang="ts">
    import ArrowLeft from "lucide-svelte/icons/arrow-left";
    import * as Card from "$lib/components/primitives/card/index.js";
    import * as Tabs from "$lib/components/primitives/tabs/index.js";
    import type { Snippet } from "svelte";
    import UserMenu from "./UserMenu.svelte";
    import type { Tab } from "$lib/components/composites/navigation-bar/types";
    import type { User } from "$lib/model/backend";

    interface Props {
        user: User;
        backRef?: string | undefined;
        tabs: Tab[];
        defaultTabValue: (typeof tabs)[number]["value"];
        children?: Snippet | undefined;
    }

    const {
        user,
        backRef = undefined,
        tabs,
        defaultTabValue,
        children = undefined,
    }: Props = $props();
</script>

<header>
    <Card.Root class="shadow-lg w-fit">
        <nav class="grid grid-flow-col gap-3 items-center px-4 py-3">
            <UserMenu {user} />
            {#if backRef !== undefined}
                <a href={backRef} aria-label={`Back to ${backRef}`}>
                    <ArrowLeft class="w-6 h-6" />
                </a>
            {/if}
            <!-- Children can be e.g. a title element -->
            {@render children?.()}
            {#if tabs.length > 0}
                <Tabs.Root value={defaultTabValue}>
                    <Tabs.List>
                        {#each tabs as tab}
                            <a href={tab.href}>
                                <Tabs.Trigger value={tab.value}>
                                    <span>{tab.label}</span>
                                </Tabs.Trigger>
                            </a>
                        {/each}
                    </Tabs.List>
                </Tabs.Root>
            {/if}
        </nav>
    </Card.Root>
</header>
