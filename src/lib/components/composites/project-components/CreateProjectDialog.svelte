<script lang="ts">
    import { CirclePlus } from "lucide-svelte";
    import { buttonVariants } from "$lib/components/primitives/button";
    import Input from "$lib/components/composites/input/Input.svelte";
    import { Schema } from "$lib/schemas";
    import { cn } from "$lib/utils/shadcn-helper";
    import { goto, invalidate } from "$app/navigation";
    import { backendService } from "$lib/grpc-api";
    import InviteUsersInput from "$lib/components/composites/input/InviteUsersInput.svelte";
    import Dialog from "$lib/components/composites/dialog/Dialog.svelte";
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import Alert from "../utils/Alert.svelte";
    import LoadingButton from "../button/LoadingButton.svelte";
    import { loadingWrapper } from "$lib/utils/common-helper";

    // at the beginning the dialog should not be open
    let open: boolean = $state(false);

    const isCreatingProject = $state({ value: false });
    let projectWasCreated = $state(false);
    let projectId = $state<string | undefined>(undefined);

    let isErrorOnProjectCreation = $state(false);

    let projectNameInput: Input;
    let invitees: string[] = $state([]);

    /**
     * Navigates to the created project, if it was successfully loaded and closes the alert dialog.
     */
    async function navigateToProject() {
        if (projectId === undefined) {
            projectWasCreated = false;
        } else {
            await goto(`/project/${projectId}/dashboard`);
        }
    }

    /**
     * Creates a new project, if a non-blank project name is provided.
     *
     * Therefore, send a request to the backend to create a new project with the
     * provided name and optionally invite further members provided in the second input.
     */
    async function handleSubmit(event: Event) {
        event.preventDefault();

        if (!projectNameInput.validate()) {
            return;
        }

        await backendService
            .createProject({
                name: projectNameInput.getValue(),
            })
            .response.then(async (project) => {
                projectId = project.id;
            })
            .catch((error) => {
                isErrorOnProjectCreation = true;
                console.error(`Couldn't create project (${error})`);
            });

        if (projectId !== undefined) {
            const invitations = invitees.map(
                (email) =>
                    backendService.inviteUserToProject({ projectId: projectId!, userEmail: email })
                        .response,
            );
            await Promise.all(invitations)
                .then(() => {
                    projectWasCreated = true;
                    open = false;
                })
                .catch((error) => {
                    isErrorOnProjectCreation = true;
                    console.error(`Couldn't invite users to project (${error})`);
                });
        }
    }
</script>

<!--
@component
A dialog used to create a new project by providing a project name and an optional list of initial members
that should be invited.

Usage:
```svelte
    <CreateProjectDialog />
```
-->
<div class="px-5">
    <Dialog
        onCancelClick={() => {
            invitees = [];
            isErrorOnProjectCreation = false;
        }}
        title="Create Project"
        triggerProps={{
            class: cn(
                // Overwrite icon size in button, as the shadcn default button sets a default size for possible icons
                buttonVariants({ variant: "default" }),
                "h-fit w-full py-3 text-xl [&_svg]:size-5",
            ),
        }}
        bind:open
    >
        {#snippet trigger()}
            <div class="flex flex-row items-center justify-center gap-2.5">
                <CirclePlus strokeWidth="2.5" />
                Create Project
            </div>
        {/snippet}
        {#snippet description()}
            Start a new SLR and invite other members.
        {/snippet}
        {#snippet content()}
            <form
                id="project-creation"
                class="flex h-full w-full flex-col gap-5 overflow-x-auto"
                onsubmit={(args) => loadingWrapper(isCreatingProject, handleSubmit, args)}
            >
                <Input
                    bind:this={projectNameInput}
                    class="w-full"
                    data-testid="project-name-input"
                    inputId="project-name-input"
                    label="Name"
                    placeholder="Demo"
                    required={true}
                    schema={Schema.projectName}
                    type="text"
                />
                <InviteUsersInput bind:invitees />
            </form>
            {#if isErrorOnProjectCreation}
                <Alert
                    details="Something went wrong while creating the project. Please make sure your internet connection is stable, then try again."
                    title="Failed to Create Project"
                    variant="error"
                />
            {/if}
        {/snippet}
        {#snippet footer()}
            <LoadingButton
                class="w-full sm:w-42"
                form="project-creation"
                label="Create Project"
                loading={isCreatingProject.value}
                loadingLabel="Creating Project"
                type="submit"
            />
        {/snippet}
    </Dialog>
</div>

<AlertDialog
    actionButtonText="Open"
    actionProps={{
        onclick: async () => navigateToProject(),
    }}
    cancelProps={{
        onclick: () => {
            projectWasCreated = false;
            projectId = undefined;
            invitees = [];

            // trigger reload of the homepage, so the created project is shown in the projects list
            invalidate("data:allProjectsForUser");
        },
    }}
    title="Success! Your new project has been created successfully."
    bind:open={projectWasCreated}
>
    {#snippet description()}
        The members were invited and you can now start with the new SLR by adding sources, refine
        the review process or inviting further members.
    {/snippet}
</AlertDialog>
