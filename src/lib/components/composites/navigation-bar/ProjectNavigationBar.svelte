<script lang="ts">
    import { type Project, ProjectStatus } from "$api/project";
    import type { LinkTab } from "$lib/model/tabs";
    import NavigationBar from "$lib/components/composites/navigation-bar/NavigationBar.svelte";
    import { Badge } from "$lib/components/primitives/badge";
    import Skeleton from "$lib/components/primitives/skeleton/skeleton.svelte";

    type TabValue = (typeof tabs)[number]["value"];
    interface Props {
        projectId: string;
        loadingProject: Promise<Project>;
        defaultTabValue: TabValue;
    }

    const { projectId, loadingProject, defaultTabValue }: Props = $props();

    const tabs: LinkTab[] = $derived([
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
    ] as const);

    const backRef = "/";
</script>

<NavigationBar {backRef} {defaultTabValue} {tabs}>
    {#await loadingProject}
        <Skeleton class="h-7 w-56 rounded-full" />
    {:then project}
        <h2 class="place-content-center truncate">{project.name}</h2>
        {#if project.status === ProjectStatus.ARCHIVED}
            <Badge variant="outline">Archived</Badge>
        {/if}
    {:catch}
        <h2 class="place-content-center">Loading failed</h2>
    {/await}
</NavigationBar>
