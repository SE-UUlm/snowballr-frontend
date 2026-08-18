<script lang="ts">
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { buttonVariants } from "$lib/components/primitives/button";
    import AlertDialog from "$lib/components/composites/dialog/AlertDialog.svelte";
    import { backendService } from "$lib/grpc-api";
    import { getUserContext } from "$lib/custom-context/user-context";
    import { createActionError, type ActionError } from "$lib/model/action-error";
    import { getGrpcStatusCode, loadingWrapper } from "$lib/utils/common-helper";
    import { GrpcStatusCode } from "@protobuf-ts/grpcweb-transport";
    import type { RpcError } from "@protobuf-ts/runtime-rpc";
    import { toast } from "svelte-sonner";

    interface Props {
        projectId: string;
        isLastAdmin?: boolean;
        disabled?: boolean;
    }

    let { projectId, isLastAdmin = false, disabled = false }: Props = $props();

    const user = getUserContext();

    const LAST_ADMIN_MESSAGE =
        "You are the last admin of this project. Promote another member to admin before leaving.";

    const loading = $state({ value: false });
    let error = $state<unknown>(undefined);
    let open = $state(false);

    function getLeaveProjectError(leaveError: RpcError): ActionError {
        if (getGrpcStatusCode(leaveError.code) === GrpcStatusCode.FAILED_PRECONDITION) {
            return createActionError(
                "Couldn't Leave This Project",
                { customDetails: LAST_ADMIN_MESSAGE },
                leaveError,
            );
        }
        return createActionError(
            "Couldn't Leave This Project",
            { action: "leaving the project" },
            leaveError,
        );
    }

    async function leaveProject() {
        error = undefined;

        await backendService
            .removeProjectMember({ projectId, userEmail: user.email })
            .response.then(async () => {
                open = false;
                toast.success("You have left the project.");
                await goto(resolve("/"));
            })
            .catch((leaveError) => {
                error = getLeaveProjectError(leaveError);
                console.error(`Couldn't leave project: ${leaveError}`);
            });
    }
</script>

<!--
@component
AlertDialog to leave the current project.

Usage:
```svelte
    <LeaveProjectDialog {projectId} />
```
-->
<AlertDialog
    actionButtonLoadingText="Leave This Project"
    actionButtonText="Leave This Project"
    actionProps={{
        class: "w-full sm:w-44",
        variant: "destructiveSubtle",
        onclick: (args) => loadingWrapper(loading, leaveProject, args),
    }}
    {error}
    errorText="Couldn't leave this project"
    loading={loading.value}
    title="Leave This Project?"
    triggerProps={{
        disabled: disabled || isLastAdmin,
        class: buttonVariants({ variant: "destructiveSubtle" }),
        "aria-label": "Leave this project",
        title: isLastAdmin ? LAST_ADMIN_MESSAGE : "",
    }}
    bind:open
>
    {#snippet trigger()}
        Leave Project
    {/snippet}
    {#snippet description()}
        Once you leave, you will lose access to this project. A project admin has to re-invite you
        to regain access.
    {/snippet}
</AlertDialog>
