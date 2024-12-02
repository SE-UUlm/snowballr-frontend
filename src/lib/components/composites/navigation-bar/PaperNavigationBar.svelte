<script lang="ts">
    import NavigationBar from "./NavigationBar.svelte";
    import PaperInfo from "../paper-components/PaperInfo.svelte";
    import type { Paper, PaperSpec, User } from "$lib/types";

    interface Props {
        user: User;
        backRef?: string | undefined;
        paper: Paper | PaperSpec;
    }

    const { user, backRef, paper }: Props = $props();
</script>

<NavigationBar {user} {backRef} tabs={[]} defaultTabValue="">
    <PaperInfo {paper} />
</NavigationBar>
