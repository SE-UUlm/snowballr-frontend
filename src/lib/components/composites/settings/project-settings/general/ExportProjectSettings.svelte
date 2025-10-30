<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import LoadingButton from "$lib/components/composites/button/LoadingButton.svelte";
    import { backendService } from "$lib/grpc-api";
    import { Blob } from "$lib/model/api/base";
    import ErrorIndicator from "$lib/components/composites/utils/ErrorIndicator.svelte";
    import Select from "$lib/components/composites/select/Select.svelte";
    import { AvailableExportFormatsReply, ExportRequest } from "$lib/model/api/export";
    import { loadingWrapper, pluralize } from "$lib/utils/common-helper";

    interface Props {
        projectId: string;
    }

    const { projectId }: Props = $props();

    let loadingFormats = $state(true);
    let formats = $state<string[]>([]);
    let selectedFormats = $state<string[]>([]);
    const loadingExport = $state({ value: false });

    const formatsPromise = new Promise<AvailableExportFormatsReply>((resolve) => {
        setTimeout(() => {
            resolve(
                AvailableExportFormatsReply.create({ formats: ["JSON", "XML", "CSV", "XLSX"] }),
            );
        }, 10000);
    })

        /*const formatsPromise = backendService
        .getAvailableExportFormats(Nothing)
        .response*/ .then((availableFormats) => {
            formats = availableFormats.formats;
        })
        .finally(() => {
            loadingFormats = false;
        });

    async function exportProject() {
        loadingExport.value = false;

        const promises: Promise<Blob>[] = [];
        for (const format of selectedFormats) {
            const request: ExportRequest = {
                id: projectId,
                format,
            };
            const promise = backendService.exportProject(request).response;
            promises.push(promise);
        }

        await Promise.all(promises).then((blobs) => {
            console.log("Look at my blobs", blobs);
        });
    }
</script>

<SettingsSection sectionTitle="Export Project">
    {#await formatsPromise}
        <span class="italic">Loading formats ...</span>
    {:then}
        <span>
            You can export the project in the following
            {pluralize(formats, "format", "formats")}:
            {formats.join(", ")}.
        </span>
    {:catch}
        <ErrorIndicator errorMessage="Failed loading formats"></ErrorIndicator>
    {/await}
    <div class="flew-row flex">
        <Select
            categoryLabel="Formats"
            disabled={loadingFormats}
            noSelectIsAllSelect={false}
            options={formats.map((f) => ({ label: f, value: f }))}
            bind:selectedValues={selectedFormats}
        />
        <LoadingButton
            class="w-fit"
            disabled={selectedFormats.length === 0}
            label="Export Project"
            loading={loadingExport.value}
            loadingLabel="Exporting Project"
            onclick={(args) => loadingWrapper(loadingExport, exportProject, args)}
        />
    </div>
</SettingsSection>
