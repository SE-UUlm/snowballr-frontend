<script lang="ts">
    import { backendService } from "$lib/grpc-api";
    import { User } from "$lib/model/api/user";
    import type { ApiError } from "$lib/model/general";
    import { Schema } from "$lib/schemas";
    import { toast } from "svelte-sonner";
    import Input from "../../input/Input.svelte";
    import SettingsSection from "../SettingsSection.svelte";
    import { generateFieldMask } from "protobuf-fieldmask";
    import { getContext } from "svelte";
    import { UserContextKey } from "$lib/current-user/userContext";
    import Alert, { type AlertVariant } from "../../utils/Alert.svelte";
    import LoadingButton from "$lib/components/composites/button/LoadingButton.svelte";
    import { loadingWrapper } from "$lib/utils/common-helper";
    import { triggerUserSessionRefresh } from "$lib/current-user/userSessionStore";

    const user = $derived(getContext<() => User>(UserContextKey)());

    let firstNameInput: Input;
    let lastNameInput: Input;

    let updateUserError: (ApiError & { variant: AlertVariant }) | undefined = $state(undefined);
    const loading = $state({ value: false });

    async function handleSubmit(event: Event) {
        event.preventDefault();
        updateUserError = undefined;

        const isFirstNameValid = firstNameInput.validate();
        const isLastNameValid = lastNameInput.validate();
        if (!(isFirstNameValid && isLastNameValid)) return;

        const userData: Partial<User> = {
            id: user.id,
            firstName: firstNameInput.getValue(),
            lastName: lastNameInput.getValue(),
        };

        if (userData.firstName === user.firstName && userData.lastName === user.lastName) {
            updateUserError = {
                errorTitle: "No Changes Detected",
                errorDetails:
                    "To successfully change your name, you must provide a new one that is different from your current one.",
                variant: "warning",
            };
            return;
        }

        await backendService
            .updateUser({
                user: User.create(userData),
                mask: {
                    paths: generateFieldMask(userData),
                },
            })
            .response.then(async () => {
                triggerUserSessionRefresh();
                toast.success("Successfully updated your name.");

                // Make sure that the input fields are not focused after submitting
                (document.activeElement as HTMLElement)?.blur();
            })
            .catch((error) => {
                updateUserError = {
                    errorTitle: "Failed to Update User",
                    errorDetails:
                        "Something went wrong while updating the user. Please make sure your internet connection is stable, then try again.",
                    variant: "error",
                };
                console.error(`Couldn't update user name: ${error}`);
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
        onsubmit={(args) => loadingWrapper(loading, handleSubmit, args)}
    >
        <Input
            bind:this={firstNameInput}
            class="w-full"
            disabled={loading.value}
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
            disabled={loading.value}
            errorMessagePrefix="Last Name"
            inputId="last-name-input"
            label="Last Name"
            placeholder="Last Name"
            required
            schema={Schema.lastName}
            type="text"
            value={user.lastName}
        />
        <LoadingButton
            class="text-md w-full md:mt-5.5 md:w-80 lg:w-72 xl:w-68"
            label="Rename"
            loading={loading.value}
            loadingLabel="Renaming"
            type="submit"
        />
    </form>
    {#if updateUserError}
        <div class="max-w-100 md:max-w-200">
            <Alert
                details={updateUserError.errorDetails}
                title={updateUserError.errorTitle}
                variant={updateUserError.variant}
            />
        </div>
    {/if}
</SettingsSection>
