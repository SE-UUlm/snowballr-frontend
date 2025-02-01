<script lang="ts">
    import { CirclePlus, LoaderCircle } from "lucide-svelte";
    import { Button, buttonVariants } from "$lib/components/primitives/button";
    import * as Dialog from "$lib/components/primitives/dialog";
    import * as AlertDialog from "$lib/components/primitives/alert-dialog";
    import * as Alert from "$lib/components/primitives/alert";
    import Input from "$lib/components/composites/input/Input.svelte";
    import { Schema } from "$lib/schemas";
    import { cn } from "$lib/utils/shadcn-helper";
    import ChipsInput from "$lib/components/composites/input/ChipsInput.svelte";
    import { onMount } from "svelte";
    import type { User } from "$lib/model/backend";
    import { BackendController } from "$lib/controller/backend-controller";
    import { Fzf } from "fzf";
    import { goto } from "$app/navigation";
    import CircleAlert from "lucide-svelte/icons/circle-alert";
    import { getNames } from "$lib/utils/common-helper";
    import type { ValidationResult } from "$lib/model/general";

    // at the beginning the dialog should not be open
    let open: boolean = $state(false);

    let isServerStillCreatingProject = $state(false);
    let projectWasCreated = $state(false);
    let projectId = $state<number | undefined>(undefined);

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
            // TODO: exchange by call to store or so, if login etc. is completely implemented
            let thisUser: User = await BackendController.getInstance().thisUser().get();
            initialPossibleMembers = await BackendController.getInstance()
                .getUsers()
                .then((users) => users.filter((user) => user.id !== thisUser.id));
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
        const fzf = new Fzf(possibleMembers.map((user) => `${getNames([user])} <${user.email}>`));
        return fzf.find(input.toLowerCase()).map((result) => result.item);
    }

    /**
     * Checks, whether a given input is a valid name of a registered user or an email.
     */
    function validateInput(input: string): ValidationResult {
        if (!Schema.email.safeParse(input.trim()).success) {
            const matchingMembers = possibleMembers.filter(
                (member) => getNames([member]) === input.trim(),
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
        let possibleMatchedUser = possibleMembers.filter(
            (user) =>
                getNames([user]) === input ||
                user.email === input ||
                `${getNames([user])} <${user.email}>` === input,
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
        let name = getNames(initialPossibleMembers.filter((user) => input === user.email));
        return name !== "" ? name : undefined;
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
        await BackendController.getInstance()
            .createProject({
                name: projectNameInput.getValue(),
            })
            .then(async (project) => {
                projectId = project.id;

                return Promise.all(
                    membersInput.map((member) =>
                        BackendController.getInstance().project(projectId!).inviteUser(member),
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
    <Dialog.Content id="dialog-content">
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
                <Alert.Root variant="destructive">
                    <CircleAlert class="size-4" />
                    <Alert.Title>Something went wrong while loading possible members.</Alert.Title>
                    <Alert.Description
                        >Please check your connection and try again.</Alert.Description
                    >
                </Alert.Root>
            {/if}
        </form>
        {#if isErrorOnProjectCreation}
            <Alert.Root variant="destructive">
                <CircleAlert class="size-4" />
                <Alert.Title>Something went wrong while creating the project.</Alert.Title>
                <Alert.Description>Please check your connection and try again.</Alert.Description>
            </Alert.Root>
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
            <AlertDialog.Title
                >Success! Your new project has been created successfully.</AlertDialog.Title
            >
            <AlertDialog.Description>
                The members were invited and you can now start with the new SLR by adding sources,
                refine the review process or inviting further members.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Back</AlertDialog.Cancel>
            <AlertDialog.Action onclick={async () => navigateToProject()}>Open</AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
