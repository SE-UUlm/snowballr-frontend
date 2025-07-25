<script lang="ts">
    import ChipsInput from "./ChipsInput.svelte";
    import type { User } from "$lib/model/api/user";
    import { getName } from "$lib/utils/common-helper";
    import type { ValidationResult } from "$lib/model/general";
    import { Schema } from "$lib/schemas";
    import Alert from "../utils/Alert.svelte";
    import { backendService } from "$lib/grpc-api.js";

    interface Props {
        invitees: string[];
        projectId?: string;
    }

    let { invitees = $bindable(), projectId = "" }: Props = $props();

    let isErrorWhileLoadingCandidates = $state(false);

    /** Collection of loaded invite candidates based on the current input and already added
     *  input candidates that should be definitely invited
     */
    let loadedInviteCandidates = $state<User[]>([]);

    /**
     * Checks whether a candidate, represented by the input email or name, already was added as
     * invitee.
     */
    function isCandidateAlreadyInvitee(input: string): boolean {
        return (
            invitees.includes(input) ||
            loadedInviteCandidates.some((c) => getName(c) === input && invitees.includes(c.email))
        );
    }

    /**
     * Fetches a list of invite candidates from the backend based on the given search string.
     * The backend is responsible for filtering and ranking the users.
     *
     * In case of a loading error, an empty list is returned and an error flag is set to
     * display an error alert.
     *
     * @param input - the content of the input field, i.e. the search string
     * @returns list of "name \<email\>" representations of users that can be invited
     */
    async function loadInviteCandidates(input: string): Promise<string[]> {
        return backendService
            .getInviteCandidates({ query: input, projectId })
            .response.then(({ users }) => {
                isErrorWhileLoadingCandidates = false;

                const newInviteCandidates = users.filter(
                    (user) => !isCandidateAlreadyInvitee(user.email),
                );
                const retainedCandidates = loadedInviteCandidates.filter((c) =>
                    invitees.includes(c.email),
                );

                loadedInviteCandidates = [...newInviteCandidates, ...retainedCandidates];

                return newInviteCandidates.map((user) => `${getName(user)} <${user.email}>`);
            })
            .catch(() => {
                isErrorWhileLoadingCandidates = true;
                loadedInviteCandidates = [];
                return [];
            });
    }

    /**
     * Checks, whether a given input is valid, i.e.
     *   - a valid email
     *   - the name of a registered user
     *   - no duplicate, i.e., neither the name nor the email of a user
     *     already in the list of invitees
     *
     *  Depending on the reason why the input is invalid, different error messages are returned.
     */
    function validateInput(input: string): ValidationResult {
        const trimmedInput = input.trim();

        if (isCandidateAlreadyInvitee(trimmedInput)) {
            return {
                success: false,
                error: "This candidate has already been added to the invite list.",
            };
        }

        const isEmail = Schema.email.safeParse(trimmedInput).success;
        const isKnownCandidate = loadedInviteCandidates.some(
            (user) => trimmedInput === getName(user),
        );

        if (!isEmail && !isKnownCandidate) {
            return {
                success: false,
                error: "Please enter a valid name or email. Consider that project members can not be invited again.",
            };
        }

        return { success: true };
    }

    /**
     * Maps a valid name to the email of the user.
     *
     * If multiple users with the given name exist, the first matching user is taken.
     *
     * Example:
     * The user \{ firstName: "John", lastName: "Doe", email: "john.doe\@example.com", ... \}
     * is in the list of possible members. Then the input
     * - "John Doe"
     * - "john.doe\@example.com"
     * - "John Doe \<john.doe\@example.com\>"
     * all are mapped to "john.doe\@example.com"
     *
     * @param input - the name, email or combination of name \<email\> of a known user
     * @returns the corresponding email of the user identified by the input
     */
    function mapNameToEmail(input: string): string | undefined {
        return loadedInviteCandidates.find((user) => {
            const name = getName(user);
            return [name, user.email, `${name} <${user.email}>`].includes(input);
        })?.email;
    }

    /**
     * Get the name of a user identified by its email.
     *
     * @param input - the email of the user
     * @returns the name of the user or undefined, if the no user with the given email was found
     */
    function mapEmailToName(input: string): string | undefined {
        const user = loadedInviteCandidates.find((user) => input === user.email);
        return user !== undefined ? getName(user) : input;
    }
</script>

<!--
@component
Input element that allows the user to search for and invite existing users directly or
to invite not registered users by their email address.

The email addresses of the candidates that were input and should be invited are bound to
`invitee` property. Optionally, it is possible to provide a `project_id` if new members
should be invited into an existing project and current project members should not be proposed
as invite candidates.

Usage:
```svelte
    <InviteUsersInput
        bind:invitee
        projectId={"1"}
    />
```
-->
<div class="flex flex-col gap-2">
    <ChipsInput
        displayItem={mapEmailToName}
        label="Members"
        resolveAlias={mapNameToEmail}
        searchSuggestions={loadInviteCandidates}
        validate={validateInput}
        bind:items={invitees}
    />
    {#if isErrorWhileLoadingCandidates}
        <Alert
            details="Something went wrong while loading possible project members. Please make sure your internet connection is stable, then try again."
            title="Failed to load invite candidates."
            variant="error"
        />
    {/if}
</div>
