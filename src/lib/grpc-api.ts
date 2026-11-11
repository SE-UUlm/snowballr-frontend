// Transitional re-export: files that still call the client directly keep working while they move to
// the domain modules in `$lib/api/`. Delete this file once nothing imports it.
export { client as backendService } from "$lib/api/client";
