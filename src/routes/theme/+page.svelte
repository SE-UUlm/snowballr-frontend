<script>
    import Alert from "$lib/components/composites/utils/Alert.svelte";
</script>

<svelte:head>
    <title>Theme</title>
</svelte:head>
<div>
    <h1>H1 Element (h3 in figma)</h1>
    <h2>H2 Element (h4 in figma)</h2>
    <h3>H3 Element (list in figma)</h3>
    <div class="text-placeholder">
        Placeholder Element (subtle-medium in figma + italic + slate/500)
    </div>
    <div class="text-hint">Hint Element (detail in figma + neutral/500)</div>
    <div class="text-default">Default Element (subtle in figma)</div>
    <div class="text-default-m">Default Element (subtle-medium in figma)</div>
    <div class="text-default-sb">Default Element (subtle-semibold in figma)</div>
</div>
<div class="bg-gray-800 py-1">
    <div class="text-decline-red">This is a decline-red colored text</div>
    <div class="text-maybe-yellow">This is a maybe-yellow colored text</div>
    <div class="text-accept-green">This is an accept-green colored text</div>
    <div class="text-warning-amber">This is a warning-amber colored text</div>
</div>

<div class="w-fit bg-white p-3">
    <div class="border-container-border-grey rounded-md border p-2 shadow-lg">
        <div
            class="border-input-border-slate text-input-placeholder-slate m-2 w-fit rounded-md border p-2"
        >
            This is a container with an input-border-slate border and an input-placeholder-slate
            text inside a container with a container-border-grey border (and shadow)
        </div>
    </div>
</div>

<Alert
    details="This is a standard alert used to convey general information or updates that don't fall into a specific category."
    title="Default Alert"
    variant="default"
/>
<Alert
    details="The operation was completed successfully. You can now proceed with the next steps or return to the dashboard."
    title="Success Alert"
    variant="success"
/>
<Alert
    details="Here's some useful information that might help you understand the context or make a better decision."
    title="Info Alert"
    variant="info"
/>
<Alert
    details="Be cautious—there might be potential issues or actions that could lead to unintended consequences."
    title="Warning Alert"
    variant="warning"
/>
<Alert
    details="An error occurred while processing your request. Please check the details and try again or contact support."
    title="Error Alert"
    variant="error"
/>
