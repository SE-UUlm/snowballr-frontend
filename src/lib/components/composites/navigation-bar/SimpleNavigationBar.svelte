<script lang="ts">
    import NavigationBar from "./NavigationBar.svelte";
    import type { Tab } from "$lib/components/composites/navigation-bar/types";
    import type { User } from "$lib/types";

    interface Props {
        user: User;
        backRef?: string | undefined;
        title: string;
        tabs: Tab[];
        defaultTabValue: (typeof tabs)[number]["value"];
    }

    const { user, backRef = undefined, title, tabs, defaultTabValue }: Props = $props();
</script>

<NavigationBar {user} {backRef} {tabs} {defaultTabValue}>
    <h2 class="place-content-center truncate">{title}</h2>
</NavigationBar>
