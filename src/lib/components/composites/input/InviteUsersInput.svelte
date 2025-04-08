<script lang="ts">
    import ErrorAlert from "../utils/ErrorAlert.svelte";
    import ChipsInput from "./ChipsInput.svelte";
    import type { User } from "$lib/model/api/user";
    import { filterUsers } from "$lib/utils/filters";
    import { getName } from "$lib/utils/common-helper";
    import type { ValidationResult } from "$lib/model/general";
    import { Schema } from "$lib/schemas";

    interface Props {
        membersInput: string[];
        initialPossibleMembers: User[];
        isErrorOnUsersLoading: boolean;
    }

    let {
        membersInput = $bindable(),
        initialPossibleMembers,
        isErrorOnUsersLoading,
    }: Props = $props();

    let possibleMembers: User[] = $derived(
        initialPossibleMembers.filter((member) => !membersInput.includes(member.email)),
    );

    /**
     * Filters all possible members by checking, whether their name or email contains the search string.
     *
     * Furthermore, the filtered list is sorted by the score from the FZF algorithm, i.e.
     * the members with the best matching name or email are at the beginning of the list (and will
     * appear at the top of the suggestions list).
     *
     * @param input - the content of the input field, i.e. the search string
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
        }
        return { success: true };
    }

    /**
     * Maps a valid name to the email of the user.
     *
     * If multiple users with the given name exist, the name can not be mapped and a hint is displayed.
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
     * @returns the corresponding email of the user identified by the given name, email or name + email combination
     */
    function mapNameToEmail(input: string): string | undefined {
        const possibleMatchedUser = possibleMembers.filter((user) => {
            const name = getName(user);
            return [name, user.email, `${name} <${user.email}>`].includes(input);
        });

        return possibleMatchedUser.at(0)?.email;
    }

    /**
     * Get the name of a user identified by its email.
     *
     * @param input - the email of the user
     * @returns the name of the user or undefined, if the no user with the given email was found
     */
    function mapEmailToName(input: string): string | undefined {
        const user = initialPossibleMembers.find((user) => input === user.email);
        return user !== undefined ? getName(user) : input;
    }
</script>

<!--
@component
Input element that allows the user to search for and invite existing users and
to invite non-existing users by their email address.

Usage:
```svelte
    <InviteUsersInput
        bind:membersInput
        {initialPossibleMembers}
        {isErrorOnUsersLoading}
    />
```
-->
<div class="flex flex-col gap-2">
    <ChipsInput
        displayItem={mapEmailToName}
        label="Members"
        resolveAlias={mapNameToEmail}
        searchSuggestions={filterPossibleMembers}
        validate={validateInput}
        bind:items={membersInput}
    />
    {#if isErrorOnUsersLoading}
        <ErrorAlert errorTitle="Something went wrong while loading possible members." />
    {/if}
</div>
