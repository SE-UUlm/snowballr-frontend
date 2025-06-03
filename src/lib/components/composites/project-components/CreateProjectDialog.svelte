<script lang="ts">
    import { CirclePlus } from "lucide-svelte";
    import { buttonVariants } from "$lib/components/primitives/button";
    import Input from "$lib/components/composites/input/Input.svelte";
    import { Schema } from "$lib/schemas";
    import { cn } from "$lib/utils/shadcn-helper";
    import { goto, invalidate } from "$app/navigation";
    import { backendService } from "$lib/grpc-api";
    import { User } from "$lib/model/api/user";
    import InviteUsersInput from "$lib/components/composites/input/InviteUsersInput.svelte";
    import Dialog from "$lib/components/composites/dialog/Dialog.svelte";
    import { getContext, onMount } from "svelte";
    import { loadUsers } from "$lib/components/composites/input/loading-users";
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import { UserContextKey } from "$lib/global-context/userContext";
    import Alert from "../utils/Alert.svelte";
    import LoadingButton from "../button/LoadingButton.svelte";
    import { loadingWrapper } from "$lib/utils/common-helper";

    const user = getContext<() => User>(UserContextKey)();

    // at the beginning the dialog should not be open
    let open: boolean = $state(false);

    const isCreatingProject = $state({ value: false });
    let projectWasCreated = $state(false);
    let projectId = $state<string | undefined>(undefined);

    let isErrorOnProjectCreation = $state(false);
    let isErrorOnUsersLoading = $state(false);

    let projectNameInput: Input;
    let membersInput: string[] = $state([]);
    let isLoadingUsers = $state(true);
    let initialPossibleMembers: User[] = $state([]);

    onMount(async () => {
        const result = await loadUsers(user);
        initialPossibleMembers = result.initialPossibleMembers;
        isErrorOnUsersLoading = result.isErrorOnUsersLoading;
        isLoadingUsers = false;
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

        await Promise.all(
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
    }
</script>

<!--
@component
`Dialog` used to create a project by providing a project name and an optional list of initial members.

Usage:
```svelte
    <CreateProjectDialog />
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
            disabled: isLoadingUsers,
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
                <InviteUsersInput
                    {initialPossibleMembers}
                    {isErrorOnUsersLoading}
                    bind:membersInput
                />
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
