<script lang="ts">
    import NavigationBar from "./NavigationBar.svelte";

    interface Props {
        user: { firstName: string; lastName: string };
        backRef?: string | undefined;
        title: string;
        tabs: {
            value: string;
            label: string;
            href: string;
        }[];
        defaultTabValue: string;
    }

    const { user, backRef = undefined, title, tabs, defaultTabValue }: Props = $props();
</script>

<NavigationBar {user} {backRef} {tabs} {defaultTabValue}>
    <h2 class="place-content-center truncate">{title}</h2>
</NavigationBar>
