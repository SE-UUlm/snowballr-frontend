<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { Button } from "$lib/components/primitives/button";

    const errorDetails = $derived(() => {
        const status = page.status;

        let title: string;
        let headline: string;
        let body: string;

        // Set default messages based on common status codes
        switch (status) {
            case 401:
                title = "Unauthorized";
                headline = "Authentication Required";
                body = "You need to be logged in to view this page.";
                break;
            case 403:
                title = "Forbidden";
                headline = "Permission Denied";
                body = "You do not have the necessary permissions to access this page.";
                break;
            case 404:
                title = "Not Found";
                headline = "Page Not Found";
                body = "Sorry, the page you are looking for does not exist.";
                break;
            case 500:
                title = "Server Error";
                headline = "Internal Server Error";
                body = "A server-side error occurred. Please retry or contact support.";
                break;
            case 501:
                title = "Not Implemented";
                headline = "Feature Not Available";
                body = "This feature is not yet implemented. Please check back later.";
                break;
            case 502:
                title = "Bad Gateway";
                headline = "Bad Gateway";
                body = "We are having trouble connecting to the server. Please try again later.";
                break;
            case 503:
                title = "Service Unavailable";
                headline = "Service Temporarily Unavailable";
                body =
                    "We are currently performing maintenance or experiencing high traffic. Please try again in a few moments.";
                break;
            default:
                // Fallback for other generic 4xx and 5xx errors
                if (status >= 400 && status < 500) {
                    title = "Client Error";
                    headline = "Bad Request";
                    body = "There was a problem with the request.";
                } else if (status >= 500 && status < 600) {
                    title = "Server Error";
                    headline = "An Unexpected Server Error Occurred";
                    body = "An unexpected error occurred on our servers.";
                } else {
                    title = "Error";
                    headline = "An Error Occurred";
                    body = "Something went wrong.";
                }
        }

        return { title, headline, body };
    });
</script>

<svelte:head>
    <title>{page.status} | {errorDetails().title}</title>
</svelte:head>

<main class="flex h-full w-full flex-col items-center justify-center gap-1 text-center">
    <h1 class="mb-4 text-8xl">{errorDetails().headline}</h1>
    <div class="text-default">{errorDetails().body}</div>
    <div class="text-default">(Error Code: {page.status})</div>
    <Button class="mt-6" onclick={() => goto("/")}>Back to Dashboard</Button>
</main>
