<script lang="ts">
    import NavigationBar from "./NavigationBar.svelte";
    import PaperInfo from "../paper-components/PaperInfo.svelte";
    import type { Paper } from "$lib/model/api/paper";
    import type { User } from "$lib/model/api/user";

    interface Props {
        user: User;
        backRef?: string | undefined;
        loadingPaper: Promise<Paper | Omit<Paper, "id">>;
    }

    const { user, backRef, loadingPaper }: Props = $props();
</script>

<NavigationBar {backRef} {user}>
    <PaperInfo {loadingPaper} />
</NavigationBar>
