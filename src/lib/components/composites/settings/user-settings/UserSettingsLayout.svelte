<script lang="ts">
    import type { Snippet } from "svelte";
    import type { IconLinkTab } from "$lib/model/tabs";
    import SettingsLayout from "../SettingsLayout.svelte";
    import ClipboardCheck from "@lucide/svelte/icons/clipboard-check";
    import Settings from "@lucide/svelte/icons/settings";
    import Box from "@lucide/svelte/icons/box";
    import Keyboard from "@lucide/svelte/icons/keyboard";

    type TabValue = (typeof tabs)[number]["value"];
    interface Props {
        selectedTab: TabValue;
        children?: Snippet | undefined;
    }

    let { selectedTab, children = undefined }: Props = $props();

    const tabs: IconLinkTab[] = [
        {
            value: "account",
            label: "Account",
            href: `/settings/account`,
            icon: Settings,
        },
        {
            value: "projectsetup",
            label: "Project Setup",
            href: `/settings/projectsetup`,
            icon: Box,
        },
        {
            value: "shortcuts",
            label: "Shortcuts",
            href: `/settings/shortcuts`,
            icon: Keyboard,
        },
        {
            value: "review",
            label: "Review",
            href: `/settings/review`,
            icon: ClipboardCheck,
        },
    ] as const;
</script>

<SettingsLayout {selectedTab} {tabs}>
    {@render children?.()}
</SettingsLayout>
