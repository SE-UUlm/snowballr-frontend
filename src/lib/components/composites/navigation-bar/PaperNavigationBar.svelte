<script lang="ts">
    import NavigationBar from "./NavigationBar.svelte";
    import PaperInfo from "../paper-components/PaperInfo.svelte";

    interface Props {
        user: {
            firstName: string;
            lastName: string;
        };
        backRef?: string | undefined;
        paper: {
            id?: number | undefined;
            title: string;
            authors: string[];
        };
    }

    const { user, backRef, paper }: Props = $props();
</script>

<NavigationBar {user} {backRef} tabs={[]} defaultTabValue="">
    <PaperInfo {paper} />
</NavigationBar>
