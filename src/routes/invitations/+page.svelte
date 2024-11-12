<script lang="ts">
    import NavigationBar from "$lib/components/custom/NavigationBar.svelte";

    let user = {
        firstName: "Max",
        lastName: "Mustermann",
    };
</script>

<NavigationBar {user} pageTitle="Invitations" backRef="/" />
