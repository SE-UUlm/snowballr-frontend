// The generated API types and enums that code outside src/lib/api/ uses, under their generated names.
// Only src/lib/api/ imports @se-uulm/snowballr-grpc-client directly, so add a type here when a route or
// component needs one. Names like Project_Paper change with the REST client, see #771.
export { AuthenticationStatus } from "@se-uulm/snowballr-grpc-client/authentication";
export { Criterion, CriterionCategory } from "@se-uulm/snowballr-grpc-client/criterion";
export {
    FetcherInformation,
    FetcherOptionSchema,
    FetcherOptions,
} from "@se-uulm/snowballr-grpc-client/fetcher";
export { Author, Paper, Paper_ExternalId } from "@se-uulm/snowballr-grpc-client/paper";
export {
    MemberRole,
    PaperDecision,
    Project,
    ProjectStatus,
    Project_Information,
    Project_Information_DecisionStatistics,
    Project_Member,
    Project_Paper,
    Project_Settings,
    SnowballingType,
} from "@se-uulm/snowballr-grpc-client/project";
export { Review, ReviewDecision } from "@se-uulm/snowballr-grpc-client/review";
export { User, UserRole } from "@se-uulm/snowballr-grpc-client/user";
export { UserSettings } from "@se-uulm/snowballr-grpc-client/user_settings";
export { Timestamp } from "@se-uulm/snowballr-grpc-client/google/protobuf/timestamp";
