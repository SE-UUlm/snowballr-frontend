<script lang="ts">
    import type { Snippet } from "svelte";
    import Settings from "lucide-svelte/icons/settings";
    import Users from "lucide-svelte/icons/users";
    import Snowflake from "lucide-svelte/icons/snowflake";
    import ClipboardCheck from "lucide-svelte/icons/clipboard-check";
    import type { IconLinkTab } from "$lib/model/tabs";
    import SettingsLayout from "../SettingsLayout.svelte";

    type ProjectTabValue = "general" | "members" | "slr" | "review";

    interface Props {
        projectId: string;
        selectedTab: ProjectTabValue;
        children?: Snippet | undefined;
        isCurrentUserAdmin: boolean;
    }

    let { projectId, selectedTab, children = undefined, isCurrentUserAdmin }: Props = $props();

    const ALL_TABS = [
        {
            value: "general",
            label: "General",
            href: `/project/${projectId}/settings/general`,
            icon: Settings,
            adminOnly: false,
        },
        {
            value: "members",
            label: "Members",
            href: `/project/${projectId}/settings/members`,
            icon: Users,
            adminOnly: false,
        },
        {
            value: "slr",
            label: "SLR",
            href: `/project/${projectId}/settings/slr`,
            icon: Snowflake,
            adminOnly: true,
        },
        {
            value: "review",
            label: "Review",
            href: `/project/${projectId}/settings/review`,
            icon: ClipboardCheck,
            adminOnly: false,
        },
    ];

    let tabs = $derived<IconLinkTab[]>(
        ALL_TABS.filter((tab) => !(tab.adminOnly && !isCurrentUserAdmin)).map(
            (tab) =>
                ({
                    value: tab.value,
                    label: tab.label,
                    href: tab.href,
                    icon: tab.icon,
                }) as IconLinkTab,
        ),
    );
</script>

<!--
@component
`SettingsLayout` for the project settings.

Tabs:
- General
- Members
- SLR
- Review

Usage:
```svelte
    <ProjectSettingsLayout {projectId} selectedTab="general isCurrentUserAdmin={true}>">
        <span>This is the general settings page</span>
    </ProjectSettingsLayout>
```
-->
<SettingsLayout {selectedTab} {tabs}>
    {@render children?.()}
</SettingsLayout>
