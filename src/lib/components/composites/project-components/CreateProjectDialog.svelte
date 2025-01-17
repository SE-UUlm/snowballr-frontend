<script lang="ts">
    import { CirclePlus } from "lucide-svelte";
    import { Button, buttonVariants } from "$lib/components/primitives/button";
    import * as Dialog from "$lib/components/primitives/dialog";
    import Input from "$lib/components/composites/input/Input.svelte";
    import { Schema } from "$lib/schemas";
    import { cn } from "$lib/utils/shadcn-helper";
    import ChipsInput from "$lib/components/composites/input/ChipsInput.svelte";
    import { onMount } from "svelte";
    import type { User } from "$lib/model/backend";
    import { BackendController } from "$lib/controller/backend-controller";
    import { distance } from "fastest-levenshtein";
    import { goto } from "$app/navigation";
    // at the beginning the dialog should not be open
    let open: boolean = $state(false);

    let projectNameInput: Input;
    let membersInput: string[] = $state([]);

    // TODO: check, whether this solution scales as the backend contains hundreds / thousands of users
    // list of possible members (represented by their E-Mail) that can be invited
    let possibleMemberEMails: string[] = [];
    onMount(async () => {
        let possibleMembers: User[] = await BackendController.getInstance().getUsers();
        let thisUser: User = await BackendController.getInstance().thisUser().get();

        possibleMemberEMails = possibleMembers
            .filter((user) => user !== thisUser)
            .map((user) => user.email)
            .map((email) => email.toLowerCase());
    });

    /**
     * Filters all possible members by checking, whether their E-Mail contains the search string.
     *
     * Furthermore, the filtered list of E-Mails is sorted by the Levenshtein distance, i.e.
     * the members with the best matching E-Mail are at the beginning of the list (and will
     * appear at the top of the suggestions list).
     *
     * @param input the content of the input field, i.e. the search string
     * @returns
     */
    function filterPossibleMembers(input: string): string[] {
        input = input.toLowerCase();

        return possibleMemberEMails
            .filter((item) => item.includes(input))
            .sort((a, b) => distance(a, input) - distance(b, input));
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

        // create project
        let project = await BackendController.getInstance().createProject({
            name: projectNameInput.getValue(),
        });
        // invite members (if necessary)
        membersInput.forEach((email) =>
            BackendController.getInstance().project(project.id).inviteUser(email),
        );

        await goto(`/project/${project.id}/dashboard`);
    }
</script>

<Dialog.Root bind:open>
    <div class="px-5">
        <!-- need to overwrite svg size in button, as the shadcn default button sets a default size
                 for possible icons, which cannot be overwritten by set the size inside the icon -->
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
                searchSuggestions={filterPossibleMembers}
            />
        </form>
        <Dialog.Footer>
            <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
            <Button type="submit" form="project-creation">Create Project</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
