<script lang="ts">
    import type { Snippet } from "svelte";
    import Settings from "lucide-svelte/icons/settings";
    import Users from "lucide-svelte/icons/users";
    import Snowflake from "lucide-svelte/icons/snowflake";
    import ClipboardCheck from "lucide-svelte/icons/clipboard-check";
    import type { IconLinkTab } from "$lib/model/tabs";
    import SettingsLayout from "./SettingsLayout.svelte";

    type TabValue = (typeof tabs)[number]["value"];
    interface Props {
        projectId: string;
        selectedTab: TabValue;
        children?: Snippet | undefined;
    }

    let { projectId, selectedTab, children = undefined }: Props = $props();

    const tabs: IconLinkTab[] = [
        {
            value: "general",
            label: "General",
            href: `/project/${projectId}/settings/general`,
            icon: Settings,
        },
        {
            value: "members",
            label: "Members",
            href: `/project/${projectId}/settings/members`,
            icon: Users,
        },
        {
            value: "slr",
            label: "SLR",
            href: `/project/${projectId}/settings/slr`,
            icon: Snowflake,
        },
        {
            value: "review",
            label: "Review",
            href: `/project/${projectId}/settings/review`,
            icon: ClipboardCheck,
        },
    ] as const;
</script>

<SettingsLayout {selectedTab} {tabs}>
    {@render children?.()}
</SettingsLayout>
