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
            readonly id: number;
            readonly data: PaperData;
        }
        interface PaperData {
            readonly title: string;
            readonly authors: string[];
            readonly isBookmarked?: boolean;
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

export { Paper, Project, User, PaperData };
