// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
        interface Paper {
            readonly firstName: string;
            readonly lastName: string;
        }
        interface Project {
            readonly id: number;
            readonly name: string;
        }
        interface User {
            readonly firstName: string;
            readonly lastName: string;
        }
    }
}

export { Paper, Project, User };
