<script lang="ts">
    import NavigationBar from "./NavigationBar.svelte";
    import PaperInfo from "../paper-components/PaperInfo.svelte";
    import type { Paper } from "$lib/model/api/paper";
    import type { User } from "$lib/model/api/user";

    interface Props {
        user: User;
        backRef?: string | undefined;
        paper: Paper | Omit<Paper, "id">;
    }

    const { user, backRef, paper }: Props = $props();
</script>

<NavigationBar {user} {backRef}>
    <PaperInfo {paper} />
</NavigationBar>
