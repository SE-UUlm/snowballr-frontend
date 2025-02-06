import { UserRole, UserStatus } from "$lib/model/api/user";
import { PaperDecision, ProjectStatus } from "$lib/model/api/project";
import { ReviewDecision } from "$lib/model/api/review";

export const Users = {
    johnDoe: {
        id: "0",
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
    },
    janeDoe: {
        id: "1",
        email: "jane.doe@example.com",
        firstName: "Jane",
        lastName: "Doe",
        role: UserRole.DEFAULT,
        status: UserStatus.ACTIVE,
    },
};

export const Authors = {
    johnDoe: { firstName: "John", lastName: "Doe", orcid: "0000-0001-2345-6789" },
    janeSmith: { firstName: "Jane", lastName: "Smith", orcid: "0000-0002-3456-7890" },
    aliceBrown: { firstName: "Alice", lastName: "Brown", orcid: "0000-0003-4567-8901" },
    bobJohnson: { firstName: "Bob", lastName: "Johnson", orcid: "0000-0004-5678-9012" },
    emilyDavis: { firstName: "Emily", lastName: "Davis", orcid: "0000-0005-6789-0123" },
};

export const Projects = {
    demoProject: {
        id: "0",
        name: "Demo Project",
        status: ProjectStatus.ACTIVE,
        currentStage: 0n,
        maxStage: 1n,
        settings: undefined,
    },
    demoProjectArchived: {
        id: "1",
        name: "Demo Project (archived)",
        status: ProjectStatus.ARCHIVED,
        currentStage: 3n,
        maxStage: 3n,
        settings: undefined,
    },
};

export const Papers = {
    demoPaper1: {
        id: "0",
        externalId: "EXT12345",
        title: "An Analysis of TypeScript Performance",
        abstrakt:
            "This paper examines the performance characteristics of TypeScript in large-scale applications.",
        year: 2023,
        publisher: "Tech Journal",
        publicationName: "Journal of Modern Programming",
        publicationType: "Journal Article",
        hasPdf: true,
        authors: [Authors.johnDoe, Authors.bobJohnson],
        backwardReferencedIds: ["1", "2"],
    },
    demoPaper2: {
        id: "1",
        externalId: "EXT67890",
        title: "The Evolution of JavaScript Frameworks",
        abstrakt:
            "A historical overview and future trends of JavaScript frameworks in web development.",
        year: 2022,
        publisher: "Web Dev Press",
        publicationName: "Proceedings of Web Technologies",
        publicationType: "Conference Paper",
        hasPdf: false,
        authors: [Authors.johnDoe, Authors.janeSmith, Authors.aliceBrown, Authors.emilyDavis],
        backwardReferencedIds: ["3"],
    },
    demoPaper3: {
        id: "2",
        externalId: "EXT24680",
        title: "Machine Learning in Frontend Development",
        abstrakt:
            "Exploring the integration of machine learning techniques in modern frontend frameworks.",
        year: 2024,
        publisher: "AI & Web",
        publicationName: "AI in Software Engineering",
        publicationType: "Research Paper",
        hasPdf: true,
        authors: [Authors.emilyDavis, Authors.bobJohnson],
        backwardReferencedIds: ["1"],
    },
};

export const Reviews = {
    demoReview1: {
        id: "0",
        userId: "0",
        decision: ReviewDecision.DECLINED,
        selectedCriteriaIds: ["0"],
    },
    demoReview2: {
        id: "1",
        userId: "1",
        decision: ReviewDecision.MAYBE,
        selectedCriteriaIds: ["0"],
    },
    demoReview3: {
        id: "2",
        userId: "1",
        decision: ReviewDecision.ACCEPTED,
        selectedCriteriaIds: ["0"],
    },
};

export const ProjectPapers = {
    demoProjectPaper1: {
        id: "0",
        paper: Papers.demoPaper1,
        stage: 0n,
        decision: PaperDecision.UNDECIDED,
        reviews: [],
    },
    demoProjectPaper2: {
        id: "1",
        paper: Papers.demoPaper2,
        stage: 0n,
        decision: PaperDecision.UNDECIDED,
        reviews: [Reviews.demoReview1, Reviews.demoReview3],
    },
    demoProjectPaper3: {
        id: "2",
        paper: Papers.demoPaper3,
        stage: 0n,
        decision: PaperDecision.ACCEPTED,
        reviews: [Reviews.demoReview3],
    },
};
