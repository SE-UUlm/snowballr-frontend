import { User, UserRole, UserStatus } from "$api/user";
import {
    MemberRole,
    PaperDecision,
    Project,
    Project_Member,
    Project_Paper,
    ProjectStatus,
} from "$api/project";
import { Review, ReviewDecision } from "$api/review";
import { Criterion, CriterionCategory } from "$api/criterion";
import { createProjectSettings } from "./model-builder";
import type { Author, Paper } from "$api/paper";

const johnDoeUser: User = {
    id: "0",
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
};

const janeDoeUser: User = {
    id: "1",
    email: "jane.doe@example.com",
    firstName: "Jane",
    lastName: "Doe",
    role: UserRole.DEFAULT,
    status: UserStatus.ACTIVE,
};

const henryMooreUser: User = {
    id: "2",
    email: "henry.moore@example.com",
    firstName: "Henry",
    lastName: "Moore",
    role: UserRole.DEFAULT,
    status: UserStatus.ACTIVE,
};

export const Users = {
    johnDoe: johnDoeUser,
    janeDoe: janeDoeUser,
    henryMoore: henryMooreUser,
};

const johnDoeAuthor: Author = { firstName: "John", lastName: "Doe" };
const janeSmithAuthor: Author = { firstName: "Jane", lastName: "Smith" };
const aliceBrownAuthor: Author = { firstName: "Alice", lastName: "Brown" };
const bobJohnsonAuthor: Author = { firstName: "Bob", lastName: "Johnson" };
const emilyDavisAuthor: Author = { firstName: "Emily", lastName: "Davis" };

export const Authors = {
    johnDoe: johnDoeAuthor,
    janeSmith: janeSmithAuthor,
    aliceBrown: aliceBrownAuthor,
    bobJohnson: bobJohnsonAuthor,
    emilyDavis: emilyDavisAuthor,
};

const demoProjectActive: Project = {
    id: "0",
    name: "Demo Project",
    status: ProjectStatus.ACTIVE,
    currentStage: 0n,
    maxStage: 1n,
    settings: createProjectSettings(),
};

const demoProjectActiveLocked: Project = {
    id: "2",
    name: "Demo Project (locked)",
    status: ProjectStatus.ACTIVE_LOCKED,
    currentStage: 0n,
    maxStage: 1n,
    settings: createProjectSettings(),
};

const demoProjectArchived: Project = {
    id: "1",
    name: "Demo Project (archived)",
    status: ProjectStatus.ARCHIVED,
    currentStage: 3n,
    maxStage: 3n,
    settings: createProjectSettings(),
};

export const Projects = {
    demoProjectActive: demoProjectActive,
    demoProjectActiveLocked: demoProjectActiveLocked,
    demoProjectArchived: demoProjectArchived,
};

const demoPaper1: Paper = {
    id: "0",
    externalIds: [{ type: "DOI", displayType: "DOI", value: "EXT12345" }],
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
    fetcherMetadata: {},
};

const demoPaper2: Paper = {
    id: "1",
    externalIds: [{ type: "DOI", displayType: "DOI", value: "EXT67890" }],
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
    fetcherMetadata: {},
};

const demoPaper3: Paper = {
    id: "2",
    externalIds: [{ type: "DOI", displayType: "DOI", value: "EXT24680" }],
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
    fetcherMetadata: {},
};

export const Papers = {
    demoPaper1: demoPaper1,
    demoPaper2: demoPaper2,
    demoPaper3: demoPaper3,
};

const demoReview1: Review = {
    id: "0",
    userId: "0",
    decision: ReviewDecision.DECLINED,
    selectedCriteriaIds: ["0"],
};

const demoReview2: Review = {
    id: "1",
    userId: "1",
    decision: ReviewDecision.MAYBE,
    selectedCriteriaIds: ["0"],
};

const demoReview3: Review = {
    id: "2",
    userId: "1",
    decision: ReviewDecision.ACCEPTED,
    selectedCriteriaIds: ["0"],
};

export const Reviews = {
    demoReview1: demoReview1,
    demoReview2: demoReview2,
    demoReview3: demoReview3,
};

const demoProjectPaper1: Project_Paper = {
    id: "0",
    localId: "0",
    paper: Papers.demoPaper1,
    stage: 0n,
    decision: PaperDecision.UNREVIEWED,
    reviews: [],
};

const demoProjectPaper2: Project_Paper = {
    id: "1",
    localId: "1",
    paper: Papers.demoPaper2,
    stage: 0n,
    decision: PaperDecision.IN_REVIEW,
    reviews: [Reviews.demoReview1, Reviews.demoReview3],
};

const demoProjectPaper3: Project_Paper = {
    id: "2",
    localId: "2",
    paper: Papers.demoPaper3,
    stage: 0n,
    decision: PaperDecision.ACCEPTED,
    reviews: [Reviews.demoReview3],
};

export const ProjectPapers = {
    demoProjectPaper1: demoProjectPaper1,
    demoProjectPaper2: demoProjectPaper2,
    demoProjectPaper3: demoProjectPaper3,
};

const demoCriterion1: Criterion = {
    id: "0",
    tag: "E0",
    name: "Relevance",
    description: "How relevant is the paper to the project?",
    category: CriterionCategory.EXCLUSION,
};

const demoCriterion2: Criterion = {
    id: "1",
    tag: "HE0",
    name: "Quality",
    description: "How well is the paper written and structured?",
    category: CriterionCategory.HARD_EXCLUSION,
};

const demoCriterion3: Criterion = {
    id: "2",
    tag: "I0",
    name: "Novelty",
    description: "How novel are the ideas presented in the paper?",
    category: CriterionCategory.INCLUSION,
};

export const Criteria = {
    demoCriterion1: demoCriterion1,
    demoCriterion2: demoCriterion2,
    demoCriterion3: demoCriterion3,
};

const demoMember1: Project_Member = {
    user: Users.johnDoe,
    role: MemberRole.ADMIN,
};

const demoMember2: Project_Member = {
    user: Users.janeDoe,
    role: MemberRole.DEFAULT,
};

export const Members = {
    demoMember1: demoMember1,
    demoMember2: demoMember2,
};
