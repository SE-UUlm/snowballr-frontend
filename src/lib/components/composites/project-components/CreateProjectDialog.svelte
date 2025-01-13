<script lang="ts">
    import { CirclePlus } from "lucide-svelte";
    import { Button, buttonVariants } from "$lib/components/primitives/button";
    import * as Dialog from "$lib/components/primitives/dialog";
    import Input from "$lib/components/composites/input/Input.svelte";
    import { Schema } from "$lib/schemas";
    import { cn } from "$lib/utils/shadcn-helper";
    import ChipsInput from "$lib/components/composites/input/ChipsInput.svelte";

    // at the beginning the dialog should not be open
    let open: boolean = $state(false);

    let projectNameInput: Input;
    let membersInput: string[] = $state([]);

    let suggestions: string[] = ["Hello", "World", "He"];

    /**
     * Creates a new project, if a non-blank project name is provided.
     *
     * Therefore, send a request to the backend to create a new project with the
     * provided name, the current user as project admin and optionally further members
     * provided in the second input.
     */
    async function handleSubmit(event: Event) {
        event.preventDefault();

        if (!projectNameInput.validate()) {
            return;
        }
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
            <Dialog.Description
                >Start a new SLR and possibly invite other members.</Dialog.Description
            >
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
                searchSuggestions={(input) =>
                    suggestions.filter((item) => item.toLowerCase().includes(input))}
            />
        </form>
        <Dialog.Footer>
            <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
            <Button type="submit" form="project-creation">Create Project</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
