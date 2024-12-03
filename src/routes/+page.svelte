<script lang="ts">
    import SimpleNavigationBar from "$lib/components/composites/navigation-bar/SimpleNavigationBar.svelte";
    import NamedListWrapper from "$lib/components/composites/NamedListWrapper.svelte";

    const { data } = $props();
    const { user } = data;
</script>

<svelte:head>
    <title>SnowballR</title>
</svelte:head>
<SimpleNavigationBar {user} title="SnowballR" />

<main class="flex flex-row h-full w-full mb-10 gap-x-5">
    <NamedListWrapper listName={"Open Reviews"}
        ><span
            >Will be implemented in <a
                class="text-blue-400"
                href="https://github.com/SE-UUlm/snowballr-frontend/issues/121">#121</a
            >.</span
        ></NamedListWrapper
    >
    <NamedListWrapper listName={"Projects"}>list content</NamedListWrapper>
</main>
