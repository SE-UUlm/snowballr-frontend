<script lang="ts">
    import SettingsSection from "$lib/components/composites/settings/SettingsSection.svelte";
    import { Label } from "$lib/components/primitives/label";
    import * as RadioGroup from "$lib/components/primitives/radio-group/index";
    import { Project, Project_Settings, SnowballingType } from "$api/project";
    import { onMount } from "svelte";
    import { backendService } from "$lib/grpc-api";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import { toast } from "svelte-sonner";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import ActionErrorAlert from "$lib/components/composites/utils/ActionErrorAlert.svelte";

    interface Props {
        projectId: string;
        loadingProject: Promise<Project>;
        slrSettingsLocked?: boolean;
    }

    const { projectId, loadingProject, slrSettingsLocked = false }: Props = $props();
    let loading: boolean = $state(true);
    let disabled = $derived(loading || slrSettingsLocked);

    interface RadioItemProp {
        id: string;
        label: string;
        description: string;
    }
    const options: RadioItemProp[] = [
        {
            id: String(SnowballingType.FORWARD),
            label: "Forward",
            description: "Only forward references are fetched",
        },
        {
            id: String(SnowballingType.BACKWARD),
            label: "Backward",
            description: "Only backward references are fetched",
        },
        {
            id: String(SnowballingType.BOTH),
            label: "Both",
            description: "Both forward and backward references are fetched",
        },
    ];
    let selectedType: string = $state(String(SnowballingType.UNSPECIFIED));
    let initialType: string = $state(String(SnowballingType.UNSPECIFIED));
    let updateSLRSettingsError: ActionError = $state(undefined);

    onMount(() => {
        loadingProject
            .then((project) => {
                selectedType = String(
                    project.settings?.snowballingType ?? SnowballingType.UNSPECIFIED,
                );
                initialType = selectedType;
            })
            .catch((error) => {
                updateSLRSettingsError = createActionError(
                    "Failed to Load Project Settings",
                    { action: "loading the project settings" },
                    error,
                );
            })
            .finally(() => {
                loading = false;
            });
    });

    async function onTypeSelected() {
        if (initialType === selectedType || selectedType === String(SnowballingType.UNSPECIFIED))
            return;

        loading = true;
        updateSLRSettingsError = undefined;
        const projectData: Partial<Project> = {
            id: projectId,
            settings: Project_Settings.create({
                snowballingType: Number(selectedType),
            }),
        };

        await backendService
            .updateProject({
                project: Project.create(projectData),
                mask: { paths: ["project.settings.snowballing_type"] },
            })
            .response.then(() => {
                initialType = selectedType;
                toast.success("Successfully updated the project settings.");
            })
            .catch((error) => {
                updateSLRSettingsError = createActionError(
                    "Failed to Update Project Settings",
                    { action: "updating the Snowballing Type" },
                    error,
                );
                selectedType = initialType;
            })
            .finally(() => {
                loading = false;
            });
    }
</script>

<!--
@component
This component renders a section within the SLR project settings. It allows administrators to specify the Snowballing
Type. Depending on the selected type, different types of references are fetched when accepting a paper.

The `slrSettingsLocked` prop can be used to disable the switch if the SLR settings are locked, preventing any changes to
this setting.

Usage:
```svelte
  <SnowballingTypeSettings {projectId} {slrSettingsLocked} {loadingProject} />
```
-->
<SettingsSection locked={slrSettingsLocked} sectionTitle="Snowballing Type">
    <p>
        The type of Snowballing defines which references (forward and/or backward) are fetched when
        a paper is accepted. A backward reference is defined as a paper that is cited by the paper
        in question. A forward reference is defined as a paper that cites the paper in question,
        i.e., a paper where the paper in question is a backward reference. (<a
            class="underline"
            href="https://dl.acm.org/doi/10.1145/2601248.2601268"
        >
            Wohlin et. al 2014
        </a>)
    </p>
    <RadioGroup.Root bind:value={selectedType}>
        {#each options as option (option.id)}
            <div class="flex items-center space-x-2">
                {#if loading && selectedType === option.id}
                    <LoaderCircle class="size-4 animate-spin" />
                {:else}
                    <RadioGroup.Item
                        id={option.id}
                        class="hover:cursor-pointer"
                        {disabled}
                        onclick={onTypeSelected}
                        value={option.id}
                    />
                {/if}
                <Label class="hover:cursor-pointer" for={option.id}>{option.label}</Label>
                <p class="text-description">{option.description}</p>
            </div>
        {/each}
    </RadioGroup.Root>
    <ActionErrorAlert error={updateSLRSettingsError} />
</SettingsSection>
