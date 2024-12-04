<script lang="ts">
    import SimpleNavigationBar from "./SimpleNavigationBar.svelte";
    import type { Tab } from "$lib/components/composites/navigation-bar/types";
    import type { Project, User } from "$lib/model/backend";

    type TabValue = (typeof tabs)[number]["value"];
    interface Props {
        user: User;
        project: Project;
        defaultTabValue: TabValue;
    }

    const { user, project, defaultTabValue }: Props = $props();
    const tabs = [
        {
            value: "dashboard",
            label: "Dashboard",
            href: `/project/${project.id}/dashboard`,
        },
        {
            value: "papers",
            label: "Papers",
            href: `/project/${project.id}/papers`,
        },
        {
            value: "statistics",
            label: "Statistics",
            href: `/project/${project.id}/statistics`,
        },
        {
            value: "settings",
            label: "Settings",
            href: `/project/${project.id}/settings/general`,
        },
    ] as const;
</script>

<SimpleNavigationBar
    {user}
    backRef="/"
    title={project.name}
    tabs={tabs as unknown as Tab[]}
    {defaultTabValue}
/>
