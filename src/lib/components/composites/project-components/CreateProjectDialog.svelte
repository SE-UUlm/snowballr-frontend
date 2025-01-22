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
    import type { Project, User } from "$lib/model/backend";
    import { BackendController } from "$lib/controller/backend-controller";
    import { distance } from "fastest-levenshtein";
    import { goto } from "$app/navigation";
    import CircleAlert from "lucide-svelte/icons/circle-alert";
    import { getNames } from "$lib/utils/common-helper";

    // at the beginning the dialog should not be open
    let open: boolean = $state(false);

    let isServerStillCreatingProject = $state(false);
    let projectWasCreated = $state(false);
    let project = $state<Project | undefined>(undefined);

    let isErrorOnProjectCreation = $state(false);
    let isErrorOnUsersLoading = $state(false);

    let projectNameInput: Input;
    let membersInput: string[] = $state([]);

    // TODO: check, whether this solution scales as the backend contains hundreds / thousands of users
    // list of possible members that can be invited
    let possibleMembers: User[] = [];
    let possibleNamesOrEmails: string[] = [];

    onMount(async () => {
        try {
            possibleMembers = await BackendController.getInstance().getUsers();
            // TODO: exchange by call to store or so, if login etc. is completely implemented
            let thisUser: User = await BackendController.getInstance().thisUser().get();

            possibleMembers = possibleMembers.filter((user) => user.id !== thisUser.id);
            possibleNamesOrEmails = possibleMembers
                .map((user) => getNames([user]))
                .concat(possibleMembers.map((user) => user.email));
        } catch (error) {
            isErrorOnUsersLoading = true;
            console.error(`Could not get users from server (${error})`);
        }
    });

    /**
     * Filters all possible members by checking, whether their name or email contains the search string.
     *
     * Furthermore, the filtered list is sorted by the Levenshtein distance, i.e.
     * the members with the best matching name or email are at the beginning of the list (and will
     * appear at the top of the suggestions list).
     *
     * @param input the content of the input field, i.e. the search string
     * @returns list of "name \<email\>" (sorted) representations of users that can be invited
     */
    function filterPossibleMembers(input: string): string[] {
        input = input.toLowerCase();

        return possibleMembers
            .map((user) => `${getNames([user])} <${user.email}>`)
            .filter((item) => item.includes(input))
            .sort((a, b) => distance(a, input) - distance(b, input));
    }

    /**
     * Checks, whether a given input is a valid name or email of a registered user.
     */
    function validateInput(input: string): boolean {
        return possibleNamesOrEmails.includes(input.trim());
    }

    /**
     * Maps a name of a user to its corresponding email.
     */
    function getEmailFromUserName(name: string): string | undefined {
        return possibleMembers.find((user) => getNames([user]) === name)?.email;
    }

    /**
     * Maps a valid name or email of a user to the name of the user.
     *
     * @example The user {firstName: "John", lastName: "Doe, email: "john.doe@example.com", ...}
     * is in the list of possible members. Then the input
     * - "John Doe"
     * - "john.doe@example.com"
     * - "John Doe <john.doe@example.com>"
     * all are mapped to "John Doe"
     */
    function mapNameOrEmailToName(input: string): string | undefined {
        let possibleMatchedUser = possibleMembers
            .filter(
                (user) =>
                    getNames([user]) === input ||
                    user.email === input ||
                    `${getNames([user])} <${user.email}>` === input,
            )
            .at(0);

        return possibleMatchedUser !== undefined ? getNames([possibleMatchedUser]) : undefined;
    }

    /**
     * Navigates to the created project, if it was successfully loaded and closes the alert dialog.
     */
    async function navigateToProject() {
        if (project !== undefined) {
            await goto(`/project/${project.id}/dashboard`);
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
        try {
            project = await BackendController.getInstance().createProject({
                name: projectNameInput.getValue(),
            });

            if (project !== undefined) {
                await Promise.all(
                    membersInput.map((name) => {
                        let email = getEmailFromUserName(name);
                        if (email !== undefined) {
                            return BackendController.getInstance()
                                .project(project!.id)
                                .inviteUser(email);
                        }
                    }),
                );
            } else {
                isErrorOnProjectCreation = true;
                console.error("Could not create project (Project from server is undefined)");
            }
        } catch (error) {
            isErrorOnProjectCreation = true;
            console.error(`Could not create project (${error})`);
            return;
        }
        isServerStillCreatingProject = false;

        projectWasCreated = true;
        open = false;
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
        >
            <div class="flex flex-row items-center justify-center gap-2.5">
                <CirclePlus strokeWidth="2.5" />
                Create Project
            </div>
        </Dialog.Trigger>
    </div>
    <Dialog.Content>
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
                resolveAlias={mapNameOrEmailToName}
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
