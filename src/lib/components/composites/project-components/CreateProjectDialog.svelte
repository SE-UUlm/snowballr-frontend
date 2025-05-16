<script lang="ts">
    import { CirclePlus, LoaderCircle } from "lucide-svelte";
    import { Button, buttonVariants } from "$lib/components/primitives/button";
    import Input from "$lib/components/composites/input/Input.svelte";
    import { Schema } from "$lib/schemas";
    import { cn } from "$lib/utils/shadcn-helper";
    import { goto, invalidate } from "$app/navigation";
    import ErrorAlert from "$lib/components/composites/utils/ErrorAlert.svelte";
    import { backendService } from "$lib/grpc-api";
    import type { User } from "$lib/model/api/user";
    import InviteUsersInput from "$lib/components/composites/input/InviteUsersInput.svelte";
    import Dialog from "$lib/components/composites/dialog/Dialog.svelte";
    import { onMount } from "svelte";
    import { loadUsers } from "$lib/components/composites/input/loading-users";
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";

    interface Props {
        user: User;
    }

    const { user }: Props = $props();

    // at the beginning the dialog should not be open
    let open: boolean = $state(false);

    let isServerStillCreatingProject = $state(false);
    let projectWasCreated = $state(false);
    let projectId = $state<string | undefined>(undefined);

    let isErrorOnProjectCreation = $state(false);
    let isErrorOnUsersLoading = $state(false);

    let projectNameInput: Input;
    let membersInput: string[] = $state([]);
    let loading = $state(true);
    let initialPossibleMembers: User[] = $state([]);

    onMount(async () => {
        const result = await loadUsers(user);
        initialPossibleMembers = result.initialPossibleMembers;
        isErrorOnUsersLoading = result.isErrorOnUsersLoading;
        loading = false;
    });

    /**
     * Navigates to the created project, if it was successfully loaded and closes the alert dialog.
     */
    async function navigateToProject() {
        if (projectId !== undefined) {
            await goto(`/project/${projectId}/dashboard`);
        } else {
            projectWasCreated = false;
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

        isServerStillCreatingProject = true;

        backendService
            .createProject({
                name: projectNameInput.getValue(),
            })
            .response.then(async (project) => {
                projectId = project.id;

                return Promise.all(
                    membersInput.map(
                        (memberEmail) =>
                            backendService.inviteUserToProject({
                                projectId: projectId!,
                                userEmail: memberEmail,
                            }).response,
                    ),
                )
                    .then(() => {
                        projectWasCreated = true;
                        open = false;
                    })
                    .catch((error) => {
                        isErrorOnProjectCreation = true;
                        console.error(`Couldn't invite users to project (${error})`);
                    });
            })
            .catch((error) => {
                isErrorOnProjectCreation = true;
                console.error(`Couldn't create project (${error})`);
            });
        isServerStillCreatingProject = false;
    }
</script>

<!--
@component
`Dialog` used to create a project by providing a project name and an optional list of initial members.

- `user`: the current, signed in user

Usage:
```svelte
    <CreateProjectDialog {user} />
```
-->
<div class="px-5">
    <Dialog
        title="Create Project"
        triggerProps={{
            class: cn(
                // Overwrite icon size in button, as the shadcn default button sets a default size for possible icons
                buttonVariants({ variant: "default" }),
                "h-fit w-full py-3 text-xl [&_svg]:size-5",
            ),
            disabled: loading,
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
                onsubmit={handleSubmit}
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
                <InviteUsersInput
                    {initialPossibleMembers}
                    {isErrorOnUsersLoading}
                    bind:membersInput
                />
            </form>
            {#if isErrorOnProjectCreation}
                <ErrorAlert errorTitle="Something went wrong while creating the project." />
            {/if}
        {/snippet}
        {#snippet footer()}
            <Button disabled={isServerStillCreatingProject} form="project-creation" type="submit">
                {#if isServerStillCreatingProject}
                    <LoaderCircle class="animate-spin" />
                    Creating Project
                {:else}
                    Create Project
                {/if}
            </Button>
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
            membersInput = [];

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
