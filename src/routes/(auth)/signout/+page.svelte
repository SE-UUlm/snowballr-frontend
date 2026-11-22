<script lang="ts">
    import { logout } from "$lib/api/auth";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { resolve } from "$app/paths";

    onMount(async () => {
        try {
            await logout();
        } catch (e) {
            console.error("There was an error logging out: ", e);
        } finally {
            await goto(resolve("/signin"));
        }
    });
</script>
