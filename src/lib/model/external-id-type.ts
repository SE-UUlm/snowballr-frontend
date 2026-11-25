import type { SelectOption } from "#lib/model/select-option.js";

interface ExternalIdType extends SelectOption {
    /**
     * Builds the URL of the page an external ID of this type points to. The value passed in is
     * already trimmed and URL-encoded (slashes are kept, as DOIs and DBLP keys contain them).
     * Missing if IDs of this type have no page to link to.
     */
    buildUrl?: (value: string) => string;
}

const pubMedUrl = (value: string) => `https://pubmed.ncbi.nlm.nih.gov/${value}`;

/**
 * The external ID types a paper's external IDs can have, together with the page each one links to.
 *
 * This list is not defined by the backend (there is no backend endpoint for it yet), so it is
 * hardcoded here based on the identifier types the existing fetchers are known to return.
 *
 * MAG has no `buildUrl` on purpose: Microsoft Academic was shut down, so its IDs have no page.
 */
const EXTERNAL_ID_TYPES: ExternalIdType[] = [
    { value: "DOI", label: "DOI", buildUrl: (value) => `https://doi.org/${value}` },
    { value: "ARXIV", label: "ArXiv", buildUrl: (value) => `https://arxiv.org/abs/${value}` },
    { value: "MAG", label: "MAG" },
    { value: "ACL", label: "ACL", buildUrl: (value) => `https://aclanthology.org/${value}` },
    { value: "PUB_MED", label: "PubMed", buildUrl: pubMedUrl },
    { value: "MEDLINE", label: "Medline", buildUrl: pubMedUrl },
    {
        value: "PUB_MED_CENTRAL",
        label: "PubMed Central",
        buildUrl: (value) =>
            `https://pmc.ncbi.nlm.nih.gov/articles/PMC${value.replace(/^PMC/i, "")}`,
    },
    { value: "DBLP", label: "DBLP", buildUrl: (value) => `https://dblp.org/rec/${value}` },
    {
        value: "SEMANTIC_SCHOLAR",
        label: "Semantic Scholar",
        buildUrl: (value) => `https://www.semanticscholar.org/paper/${value}`,
    },
];

/** The external ID types a user can pick from when adding an external ID to a paper. */
const EXTERNAL_ID_TYPE_OPTIONS: SelectOption[] = EXTERNAL_ID_TYPES.map(({ value, label }) => ({
    value,
    label,
}));

/**
 * Returns the URL of the page an external ID points to (e.g. `https://doi.org/<doi>` for a DOI), or
 * `undefined` if its type has no known page or its value is blank.
 */
function externalIdUrl(type: string, value: string): string | undefined {
    const buildUrl = EXTERNAL_ID_TYPES.find(
        (externalIdType) => externalIdType.value === type,
    )?.buildUrl;
    const trimmedValue = value.trim();
    if (buildUrl === undefined || trimmedValue === "") return undefined;

    const encodedValue = trimmedValue.split("/").map(encodeURIComponent).join("/");
    return buildUrl(encodedValue);
}

export { EXTERNAL_ID_TYPE_OPTIONS, externalIdUrl };
