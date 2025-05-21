<script lang="ts">
    import SimpleNavigationBar from "./SimpleNavigationBar.svelte";
    import type { Project } from "$lib/model/api/project";
    import type { LinkTab } from "$lib/model/tabs";

    type TabValue = (typeof tabs)[number]["value"];
    interface Props {
        projectId: string;
        loadingProject: Promise<Project>;
        defaultTabValue: TabValue;
    }

    const { projectId, loadingProject, defaultTabValue }: Props = $props();
    const tabs: LinkTab[] = [
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
    {tabs}
/>
