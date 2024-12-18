<script lang="ts">
    import NavigationBar from "./NavigationBar.svelte";
    import PaperInfo from "../paper-components/PaperInfo.svelte";
    import type { Paper, PaperSpec, User } from "$lib/model/backend";

    interface Props {
        user: User;
        backRef?: string | undefined;
        paper: Paper | PaperSpec;
    }

    const { user, backRef, paper }: Props = $props();
</script>

<NavigationBar {user} {backRef}>
    <PaperInfo {paper} />
</NavigationBar>
