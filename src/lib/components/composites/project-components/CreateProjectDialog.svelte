<script lang="ts">
    import { CirclePlus } from "lucide-svelte";
    import { Button } from "$lib/components/primitives/button";
    import * as Dialog from "$lib/components/primitives/dialog";
    import Input from "$lib/components/composites/input/Input.svelte";
    import { BackendController } from "$lib/controller/backend-controller";

    // at the beginning the dialog should not be open
    let open: boolean = false;

    let nameInput: Input;
    let membersInput: Input;

    async function handleSubmit(event: Event) {
        event.preventDefault();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const thisUser = await BackendController.getInstance().thisUser().get();
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Trigger>
        <div class="px-5">
            <!-- need to overwrite svg size in button, as the shadcn default button sets a default size
                 for possible icons, which cannot be overwritten by set the size inside the icon -->
            <Button class="h-fit w-full py-4 gap-2.5 text-xl [&_svg]:size-5">
                <CirclePlus strokeWidth="2.5" />
                Create Project
            </Button>
        </div>
    </Dialog.Trigger>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Create Project</Dialog.Title>
            <Dialog.Description
                >Start a new SLR and possibly invite other members.</Dialog.Description
            >
        </Dialog.Header>
        <form class="flex flex-col gap-5" onsubmit={handleSubmit}>
            <Input
                class="w-full"
                inputId="project-name-input"
                label="Name"
                placeholder="Demo"
                required={false}
                type="text"
                bind:this={nameInput}
            />
            <Input
                class="w-full"
                inputId="members-input"
                label="Members"
                placeholder="John Doe, ..."
                required={false}
                type="text"
                bind:this={membersInput}
            />
        </form>
        <Dialog.Footer>
            <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
            <Button type="submit">Create Project</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
