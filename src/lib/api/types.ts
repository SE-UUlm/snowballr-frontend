// The generated API types and enums that code outside src/lib/api/ uses, under their generated names.
// Only src/lib/api/ imports snowballr-api directly, so add a type here when a route or component needs
// one. Names like Project_Paper change with the REST client, see #771.
export { AuthenticationStatus } from "snowballr-api/authentication";
export { Nothing } from "snowballr-api/base";
export { Criterion, CriterionCategory } from "snowballr-api/criterion";
export { ExportRequest } from "snowballr-api/export";
export { FetcherInformation, FetcherOptionSchema, FetcherOptions } from "snowballr-api/fetcher";
export { Author, Paper, Paper_ExternalId } from "snowballr-api/paper";
export {
    MemberRole,
    PaperDecision,
    Project,
    ProjectStatus,
    Project_Information,
    Project_Information_DecisionStatistics,
    Project_Member,
    Project_Member_List,
    Project_Paper,
    Project_Settings,
    SnowballingType,
} from "snowballr-api/project";
export { Review, ReviewDecision, Review_Create } from "snowballr-api/review";
export { User, UserRole } from "snowballr-api/user";
export { UserSettings } from "snowballr-api/user_settings";
export { Timestamp } from "snowballr-api/google/protobuf/timestamp";
// Only for the masks in src/lib/model/project-setting.ts, which move into the API layer with #777.
export { FieldMask } from "snowballr-api/google/protobuf/field_mask";
