<script lang="ts">
    import NavigationBar from "./NavigationBar.svelte";
    import type { Tab } from "$lib/components/composites/navigation-bar/types";
    import Skeleton from "$lib/components/primitives/skeleton/skeleton.svelte";
    import type { User } from "$lib/model/api/user";

    interface Props {
        user: User;
        backRef?: string | undefined;
        loadingTitle: Promise<string>;
        tabs?: Tab[] | undefined;
        defaultTabValue?: (typeof tabs)[number]["value"] | undefined;
    }

    const {
        user,
        backRef = undefined,
        loadingTitle,
        tabs = [],
        defaultTabValue = "",
    }: Props = $props();
</script>

<NavigationBar {user} {backRef} {tabs} {defaultTabValue}>
    {#await loadingTitle}
        <Skeleton class="h-7 w-56 rounded-full" />
    {:then title}
        <h2 class="place-content-center truncate">{title}</h2>
    {:catch}
        <h2 class="place-content-center">Error</h2>
    {/await}
</NavigationBar>
