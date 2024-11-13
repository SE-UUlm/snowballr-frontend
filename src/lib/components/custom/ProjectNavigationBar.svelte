<script lang="ts">
    import NavigationBar from "$lib/components/custom/NavigationBar.svelte";

    interface Props {
        user: { firstName: string; lastName: string };
        project: { id: string; name: string };
        defaultTabValue: "dashboard" | "papers" | "statistics" | "settings";
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
    ];
</script>

<NavigationBar {user} backRef="/" pageTitle={project.name} {tabs} {defaultTabValue} />
