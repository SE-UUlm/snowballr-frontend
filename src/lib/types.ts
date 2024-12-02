export interface Paper extends PaperSpec {
    readonly id: number;
}

export interface PaperSpec {
    readonly title: string;
    readonly authors: string[];
    readonly isBookmarked: boolean;
}

export interface Project {
    readonly id: number;
    readonly name: string;
}

export interface User {
    readonly firstName: string;
    readonly lastName: string;
}
