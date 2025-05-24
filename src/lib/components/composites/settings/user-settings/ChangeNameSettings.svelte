<script lang="ts">
    import { invalidate } from "$app/navigation";
    import Button from "$lib/components/primitives/button/button.svelte";
    import { backendService } from "$lib/grpc-api";
    import { User } from "$lib/model/api/user";
    import type { ApiError } from "$lib/model/general";
    import { Schema } from "$lib/schemas";
    import { toast } from "svelte-sonner";
    import Input from "../../input/Input.svelte";
    import ErrorAlert from "../../utils/ErrorAlert.svelte";
    import SettingsSection from "../SettingsSection.svelte";
    import { generateFieldMask } from "protobuf-fieldmask";
    import { getContext } from "svelte";
    import { UserContextKey } from "$lib/global-context/userContext";

    const user = getContext<() => User>(UserContextKey)();

    let firstNameInput: Input;
    let lastNameInput: Input;

    let updateUserError: ApiError | undefined = $state(undefined);

    async function handleSubmit(event: Event) {
        event.preventDefault();

        const isFirstNameValid = firstNameInput.validate();
        const isLastNameValid = lastNameInput.validate();
        if (!(isFirstNameValid && isLastNameValid)) return;

        const userData: Partial<User> = {
            id: user.id,
            firstName: firstNameInput.getValue(),
            lastName: lastNameInput.getValue(),
        };

        const updatedUser = User.create(userData);
        const maskPaths = generateFieldMask(userData).filter((path) => path !== "id");

        backendService
            .updateUser({
                user: updatedUser,
                mask: {
                    paths: maskPaths,
                },
            })
            .response.then(() => {
                invalidate("data:getCurrentUser");
                toast("Successfully updated your name.");

                // Make sure the input fields are not focused after submitting
                (document.activeElement as HTMLElement)?.blur();
            })
            .catch((error) => {
                updateUserError = { errorTitle: "Something went wrong while updating user." };
                console.error(error);
            });
    }
</script>

<!--
@component
Component for changing the user's name.

Usage:
```svelte
    <ChangeNameSettings />
```
-->
<SettingsSection sectionTitle="Change Name">
    <p class="text-base">
        Your name is displayed in the member list of projects and when hovering over your character.
    </p>
    <form
        class="flex w-full max-w-100 flex-col items-center gap-2.5 md:h-fit md:max-w-200 md:flex-row md:items-start"
        onsubmit={handleSubmit}
    >
        <Input
            bind:this={firstNameInput}
            class="w-full"
            errorMessagePrefix="First Name"
            inputId="first-name-input"
            label="First Name"
            placeholder="First Name"
            required
            schema={Schema.firstName}
            type="text"
            value={user.firstName}
        />
        <Input
            bind:this={lastNameInput}
            class="w-full"
            errorMessagePrefix="Last Name"
            inputId="last-name-input"
            label="Last Name"
            placeholder="Last Name"
            required
            schema={Schema.lastName}
            type="text"
            value={user.lastName}
        />
        <Button class="text-md w-full md:mt-5.5 md:w-25" type="submit">Rename</Button>
    </form>
    {#if updateUserError}
        <div class="max-w-100 md:max-w-200">
            <ErrorAlert
                errorDetails={updateUserError.errorDetails}
                errorTitle={updateUserError.errorTitle}
            />
        </div>
    {/if}
</SettingsSection>
