<script lang="ts">
    import * as Avatar from "$lib/components/primitives/avatar/index.js";
    import Check from "lucide-svelte/icons/check";
    import X from "lucide-svelte/icons/x";
    import { ReviewDecision } from "$lib/model/api/review";
    import type { User } from "$lib/model/api/user";

    interface Props {
        user?: User;
        reviewDecision?: ReviewDecision;
    }

    const { user, reviewDecision }: Props = $props();

    const getInitial = (text: string) => (text.length > 0 ? text[0].toUpperCase() : "");
    const userInitials = `${getInitial(user?.firstName ?? "")}${getInitial(user?.lastName ?? "")}`;
</script>

<!--
@component
Avatar displaying the initials of the user (identified by its id)
or a profile image.

This avatar component displays the set profile image or, if
no image was set, the initials of the user. For instance, the
name of the user is 'John Doe', this avatar will display
the initials 'JD'.

Optionally, a reviewDecision can be added, which visualizes
a decision of the associated user, which can be used for example
in the PaperEntry component.

Usage:
```svelte
    <UserAvatar userId={{
        id: "1",
        email: "john@doe.com",
        firstName: "John",
        lastName: "Doe",
    }} reviewDecision={ReviewDecision.ACCEPT} />
```
-->
<div class="relative">
    <Avatar.Root>
        <Avatar.Fallback class="group-hover/paper-list-entry:bg-slate-200">
            {userInitials}
        </Avatar.Fallback>
    </Avatar.Root>
    {#if reviewDecision === ReviewDecision.ACCEPTED}
        <div class="review-decision-icon-bg bg-accept-green">
            <Check size={16} color="#ffffff" strokeWidth="3" />
        </div>
    {:else if reviewDecision === ReviewDecision.DECLINED}
        <div class="review-decision-icon-bg bg-decline-red">
            <X size={16} color="#ffffff" strokeWidth="3" />
        </div>
    {:else if reviewDecision === ReviewDecision.MAYBE}
        <div class="review-decision-icon-bg bg-maybe-yellow">
            <text class="text-white">?</text>
        </div>
    {/if}
</div>
