<script lang="ts">
    import { CirclePlus, LoaderCircle } from "lucide-svelte";
    import { Button, buttonVariants } from "$lib/components/primitives/button";
    import * as Dialog from "$lib/components/primitives/dialog";
    import * as AlertDialog from "$lib/components/primitives/alert-dialog";
    import Input from "$lib/components/composites/input/Input.svelte";
    import { Schema } from "$lib/schemas";
    import { cn } from "$lib/utils/shadcn-helper";
    import ChipsInput from "$lib/components/composites/input/ChipsInput.svelte";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { getName, getNames } from "$lib/utils/common-helper";
    import type { ValidationResult } from "$lib/model/general";
    import ErrorAlert from "$lib/components/composites/ErrorAlert.svelte";
    import { backendService } from "$lib/grpc-api";
    import { Nothing } from "$lib/model/api/base";
    import type { User } from "$lib/model/api/user";
    import { filterUsers } from "$lib/utils/filters";

    // at the beginning the dialog should not be open
    let open: boolean = $state(false);

    let isServerStillCreatingProject = $state(false);
    let projectWasCreated = $state(false);
    let projectId = $state<string | undefined>(undefined);

    let isErrorOnProjectCreation = $state(false);
    let isErrorOnUsersLoading = $state(false);

    let projectNameInput: Input;
    let membersInput: string[] = $state([]);

    // TODO: check, whether this solution scales as the backend contains hundreds / thousands of users
    // list of possible members that can be invited
    let initialPossibleMembers: User[] = $state([]);
    let possibleMembers: User[] = $derived(
        initialPossibleMembers.filter((member) => !membersInput.includes(member.email)),
    );

    onMount(async () => {
        try {
            const currentUser = await backendService.getCurrentUser(Nothing).response;
            const allUsers = await backendService.getAllUsers(Nothing).response;

            initialPossibleMembers = allUsers.users.filter((user) => user.id !== currentUser.id);
        } catch (error) {
            isErrorOnUsersLoading = true;
            console.error(`Could not get users from server (${error})`);
        }
    });

    /**
     * Filters all possible members by checking, whether their name or email contains the search string.
     *
     * Furthermore, the filtered list is sorted by the score from the FZF algorithm, i.e.
     * the members with the best matching name or email are at the beginning of the list (and will
     * appear at the top of the suggestions list).
     *
     * @param input the content of the input field, i.e. the search string
     * @returns list of "name \<email\>" (sorted) representations of users that can be invited
     */
    function filterPossibleMembers(input: string): string[] {
        return filterUsers(possibleMembers, input).map(
            (member) => `${getName(member)} <${member.email}>`,
        );
    }

    /**
     * Checks, whether a given input is a valid name of a registered user or an email.
     */
    function validateInput(input: string): ValidationResult {
        if (!Schema.email.safeParse(input.trim()).success) {
            const matchingMembers = possibleMembers.filter(
                (member) => getName(member) === input.trim(),
            );
            if (matchingMembers.length === 0) {
                return { success: false, error: "Please enter a valid name or email." };
            }
            if (matchingMembers.length > 1) {
                return {
                    success: false,
                    error: "There are multiple users with this name. Please specify the user.",
                };
            }
        }
        return { success: true };
    }

    /**
     * Maps a valid name to the email of the user.
     *
     * If multiple users with the given name exist, the name can not be mapped and a hint is displayed.
     *
     * @example The user {firstName: "John", lastName: "Doe, email: "john.doe@example.com", ...}
     * is in the list of possible members. Then the input
     * - "John Doe"
     * - "john.doe@example.com"
     * - "John Doe <john.doe@example.com>"
     * all are mapped to "john.doe@example.com"
     *
     * @param input the name, email or combination of name \<email\> of a known user
     * @returns the corresponding email of the user identified by the given name, email or name + email combination
     */
    function mapNameToEmail(input: string): string | undefined {
        const possibleMatchedUser = possibleMembers.filter(
            (user) =>
                getName(user) === input ||
                user.email === input ||
                `${getName(user)} <${user.email}>` === input,
        );

        return possibleMatchedUser !== undefined ? possibleMatchedUser.at(0)?.email : undefined;
    }

    /**
     * Get the name of a user identified by its email.
     *
     * @param input the email of the user
     * @return the name of the user or undefined, if the no user with the given email was found
     */
    function mapEmailToName(input: string): string | undefined {
        const name = getNames(initialPossibleMembers.filter((user) => input === user.email));
        return name !== "" ? name : input;
    }

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
                        console.error(`Could not invite users to project (${error})`);
                        /// TODO: add hint in the *Members* page in the settings
                    });
            })
            .catch((error) => {
                isErrorOnProjectCreation = true;
                console.error(`Could not create project (${error})`);
            });
        isServerStillCreatingProject = false;
    }
</script>

<Dialog.Root bind:open>
    <div class="px-5">
        <!-- need to overwrite svg size in button, as the shadcn default button sets a default size
                for possible icons -->
        <Dialog.Trigger
            class={cn(
                buttonVariants({ variant: "default" }),
                "h-fit w-full py-3 text-xl [&_svg]:size-5",
            )}
            data-testid="dialog-trigger-button"
        >
            <div class="flex flex-row items-center justify-center gap-2.5">
                <CirclePlus strokeWidth="2.5" />
                Create Project
            </div>
        </Dialog.Trigger>
    </div>
    <Dialog.Content data-testid="dialog-content">
        <Dialog.Header>
            <Dialog.Title>Create Project</Dialog.Title>
            <Dialog.Description>Start a new SLR and invite other members.</Dialog.Description>
        </Dialog.Header>
        <form
            id="project-creation"
            class="flex flex-col w-full h-full gap-5 overflow-x-auto"
            onsubmit={handleSubmit}
        >
            <Input
                class="w-full"
                inputId="project-name-input"
                data-testid="project-name-input"
                label="Name"
                placeholder="Demo"
                required={true}
                type="text"
                schema={Schema.projectName}
                bind:this={projectNameInput}
            />

            <ChipsInput
                bind:items={membersInput}
                label="Members"
                validate={validateInput}
                searchSuggestions={filterPossibleMembers}
                resolveAlias={mapNameToEmail}
                displayItem={mapEmailToName}
            />
            {#if isErrorOnUsersLoading}
                <ErrorAlert errorTitle="Something went wrong while loading possible members." />
            {/if}
        </form>
        {#if isErrorOnProjectCreation}
            <ErrorAlert errorTitle="Something went wrong while creating the project." />
        {/if}
        <Dialog.Footer>
            <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
            {#if isServerStillCreatingProject}
                <Button type="submit" form="project-creation" disabled>
                    <LoaderCircle class="animate-spin" />
                    Creating Project
                </Button>
            {:else}
                <Button type="submit" form="project-creation">Create Project</Button>
            {/if}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<AlertDialog.Root open={projectWasCreated}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>
                Success! Your new project has been created successfully.
            </AlertDialog.Title>
            <AlertDialog.Description>
                The members were invited and you can now start with the new SLR by adding sources,
                refine the review process or inviting further members.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel
                onclick={() => {
                    projectWasCreated = false;
                    projectId = undefined;
                    membersInput = [];
                }}
            >
                Back
            </AlertDialog.Cancel>
            <AlertDialog.Action onclick={async () => navigateToProject()}>Open</AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
