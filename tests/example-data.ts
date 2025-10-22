import { UserRole, UserStatus } from "$lib/model/api/user";
import { MemberRole, PaperDecision, ProjectStatus } from "$lib/model/api/project";
import { ReviewDecision } from "$lib/model/api/review";
import { CriterionCategory } from "$lib/model/api/criterion";
import { createProjectSettings } from "./model-builder";

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
    aliceSmith: {
        id: "2",
        email: "alice.smith@example.com",
        firstName: "Alice",
        lastName: "Smith",
        role: UserRole.DEFAULT,
        status: UserStatus.ACTIVE,
    },
    bobJohnson: {
        id: "3",
        email: "bob.johnson@example.com",
        firstName: "Bob",
        lastName: "Johnson",
        role: UserRole.DEFAULT,
        status: UserStatus.DELETED,
    },
    carolWilliams: {
        id: "4",
        email: "carol.williams@example.com",
        firstName: "Carol",
        lastName: "Williams",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
    },
    davidBrown: {
        id: "5",
        email: "david.brown@example.com",
        firstName: "David",
        lastName: "Brown",
        role: UserRole.DEFAULT,
        status: UserStatus.ACTIVE,
    },
    emilyDavis: {
        id: "6",
        email: "emily.davis@example.com",
        firstName: "Emily",
        lastName: "Davis",
        role: UserRole.DEFAULT,
        status: UserStatus.DELETED,
    },
    frankMiller: {
        id: "7",
        email: "frank.miller@example.com",
        firstName: "Frank",
        lastName: "Miller",
        role: UserRole.DEFAULT,
        status: UserStatus.ACTIVE,
    },
    graceWilson: {
        id: "8",
        email: "grace.wilson@example.com",
        firstName: "Grace",
        lastName: "Wilson",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
    },
    henryMoore: {
        id: "9",
        email: "henry.moore@example.com",
        firstName: "Henry",
        lastName: "Moore",
        role: UserRole.DEFAULT,
        status: UserStatus.ACTIVE,
    },
};

export const Authors = {
    johnDoe: { firstName: "John", lastName: "Doe" },
    janeSmith: { firstName: "Jane", lastName: "Smith" },
    aliceBrown: { firstName: "Alice", lastName: "Brown" },
    bobJohnson: { firstName: "Bob", lastName: "Johnson" },
    emilyDavis: { firstName: "Emily", lastName: "Davis" },
};

export const Projects = {
    demoProjectActive: {
        id: "0",
        name: "Demo Project",
        status: ProjectStatus.ACTIVE,
        currentStage: 0n,
        maxStage: 1n,
        settings: createProjectSettings(),
    },
    demoProjectActiveLocked: {
        id: "2",
        name: "Demo Project (locked)",
        status: ProjectStatus.ACTIVE_LOCKED,
        currentStage: 0n,
        maxStage: 1n,
        settings: createProjectSettings(),
    },
    demoProjectArchived: {
        id: "1",
        name: "Demo Project (archived)",
        status: ProjectStatus.ARCHIVED,
        currentStage: 3n,
        maxStage: 3n,
        settings: createProjectSettings(),
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
        localId: "0",
        paper: Papers.demoPaper1,
        stage: 0n,
        decision: PaperDecision.UNREVIEWED,
        reviews: [],
    },
    demoProjectPaper2: {
        id: "1",
        localId: "1",
        paper: Papers.demoPaper2,
        stage: 0n,
        decision: PaperDecision.IN_REVIEW,
        reviews: [Reviews.demoReview1, Reviews.demoReview3],
    },
    demoProjectPaper3: {
        id: "2",
        localId: "2",
        paper: Papers.demoPaper3,
        stage: 0n,
        decision: PaperDecision.ACCEPTED,
        reviews: [Reviews.demoReview3],
    },
};

export const Criteria = {
    demoCriterion1: {
        id: "0",
        tag: "E0",
        name: "Relevance",
        description: "How relevant is the paper to the project?",
        category: CriterionCategory.EXCLUSION,
    },
    demoCriterion2: {
        id: "1",
        tag: "HE0",
        name: "Quality",
        description: "How well is the paper written and structured?",
        category: CriterionCategory.HARD_EXCLUSION,
    },
    demoCriterion3: {
        id: "2",
        tag: "I0",
        name: "Novelty",
        description: "How novel are the ideas presented in the paper?",
        category: CriterionCategory.INCLUSION,
    },
};

export const Members = {
    demoMember1: {
        user: Users.johnDoe,
        role: MemberRole.ADMIN,
    },
    demoMember2: {
        user: Users.janeDoe,
        role: MemberRole.DEFAULT,
    },
};
