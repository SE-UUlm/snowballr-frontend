<script lang="ts">
    import { backendService } from "$lib/grpc-api";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { Nothing } from "$api/base";
    import { resolve } from "$app/paths";

    onMount(async () => {
        try {
            await backendService.logout(Nothing);
        } catch (e) {
            console.error("There was an error logging out: ", e);
        } finally {
            await goto(resolve("/signin"));
        }
    });
</script>
