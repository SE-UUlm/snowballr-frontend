<script lang="ts">
    import "../app.css";

    let { children } = $props();
</script>

<div class="p-4">
    {@render children()}

    <br />
    <a href="theme">Theme</a><br />
    <a href="/archivedprojects">Archived Projects</a><br />
    <a href="/paper/42">Paper 42 View</a><br />
    <a href="/project/42/dashboard">Project 42 Dashboard</a><br />
    <a href="/project/42/paper/12">Project 42 Paper 12 View</a><br />
    <a href="/project/42/paper/new">Project 42 Paper Create View</a><br />
    <a href="/project/42/papers">Project 42 Papers</a><br />
    <a href="/project/42/settings/general">Project 42 General Settings</a><br />
    <a href="/project/42/settings/members">Project 42 Members Settings</a><br />
    <a href="/project/42/settings/review">Project 42 Review Settings</a><br />
    <a href="/project/42/settings/slr">Project 42 SLR Settings</a><br />
    <a href="/project/42/statistics">Project 42 Statistics</a><br />
    <a href="/readinglist">Reading List</a><br />
    <a href="/resetpassword">Reset Password</a><br />
    <a href="/settings/account">Account Settings</a><br />
    <a href="/settings/projectsetup">Project Setup Settings</a><br />
    <a href="/settings/shortcuts">Shortcuts Settings</a><br />
    <a href="/signin">Sign In</a><br />
    <a href="/signup">Sign Up</a><br />
    <a href="/">Homepage</a><br />
</div>
