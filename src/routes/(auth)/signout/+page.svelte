<script lang="ts">
    import { backendService } from "$lib/grpc-api";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { Nothing } from "$api/base";

    onMount(async () => {
        try {
            await backendService.logout(Nothing);
        } catch (e) {
            console.error("There was an error logging out: ", e);
        } finally {
            await goto("/signin");
        }
    });
</script>
