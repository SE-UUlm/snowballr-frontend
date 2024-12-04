<script lang="ts">
    import * as Avatar from "$lib/components/primitives/avatar/index.js";
    import { ReviewDecision, type User } from "$lib/model/backend";
    import Check from "lucide-svelte/icons/check";
    import X from "lucide-svelte/icons/x";

    interface Props {
        user: User;
        reviewDecision?: ReviewDecision;
    }

    const { user, reviewDecision }: Props = $props();

    const getInitial = (text: string) => (text.length > 0 ? text[0].toUpperCase() : "");
    const userInitials = `${getInitial(user.firstName)}${getInitial(user.lastName)}`;
</script>

<!--
@component
Avatar displaying the initials of the user or a profile image.

This avatar component displays the set profile image or, if
no image was set, the initials of the user. For instance, the
name of the user is 'John Doe', this avatar will display
the initials 'JD'.

Optionally, a reviewDecision can be added, which visualizes
a decision of the associated user, which can be used for example
in the PaperEntry component.

Usage:
```svelte
    <UserAvatar user={{
        ...
        firstName: "John",
        lastName: "Doe",
        ...
    }} reviewDecision: ReviewDecision.Accept />
```
-->
<div class="relative">
    <Avatar.Root>
        <Avatar.Fallback>{userInitials}</Avatar.Fallback>
    </Avatar.Root>
    {#if reviewDecision === ReviewDecision.Accepted}
        <div
            class="absolute top-6 left-6 flex justify-center items-center rounded-full bg-accept-green h-5 w-5"
        >
            <Check size={16} color="#ffffff" strokeWidth="3" />
        </div>
    {:else if reviewDecision === ReviewDecision.Declined}
        <div
            class="absolute top-6 left-6 flex justify-center items-center rounded-full bg-decline-red h-5 w-5"
        >
            <X size={16} color="#ffffff" strokeWidth="3" />
        </div>
    {:else if reviewDecision === ReviewDecision.Maybe}
        <div
            class="absolute top-6 left-6 flex justify-center items-center rounded-full bg-maybe-yellow h-5 w-5"
        >
            <text class="text-white">?</text>
        </div>
    {/if}
</div>
