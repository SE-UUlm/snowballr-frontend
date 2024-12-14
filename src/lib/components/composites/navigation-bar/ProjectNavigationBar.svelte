<script lang="ts">
    import SimpleNavigationBar from "./SimpleNavigationBar.svelte";
    import type { Tab } from "$lib/components/composites/navigation-bar/types";
    import type { User } from "$lib/model/api/user";
    import type { Project } from "$lib/model/api/project";

    type TabValue = (typeof tabs)[number]["value"];
    interface Props {
        user?: User;
        projectId: string;
        loadingProject: Promise<Project>;
        defaultTabValue: TabValue;
    }

    const { user, projectId, loadingProject, defaultTabValue }: Props = $props();
    const tabs = [
        {
            value: "dashboard",
            label: "Dashboard",
            href: `/project/${projectId}/dashboard`,
        },
        {
            value: "papers",
            label: "Papers",
            href: `/project/${projectId}/papers`,
        },
        {
            value: "statistics",
            label: "Statistics",
            href: `/project/${projectId}/statistics`,
        },
        {
            value: "settings",
            label: "Settings",
            href: `/project/${projectId}/settings/general`,
        },
    ] as const;
</script>

<SimpleNavigationBar
    backRef="/"
    {defaultTabValue}
    loadingTitle={loadingProject.then((project) => project.name)}
    tabs={tabs as unknown as Tab[]}
    {user}
/>
