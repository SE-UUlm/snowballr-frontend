import type { SelectOption } from "#lib/model/select-option.js";

/**
 * The external ID types a user can pick from when adding an external ID to a paper.
 *
 * This list is not defined by the backend (there is no backend endpoint for it yet), so it is
 * hardcoded here based on the identifier types the existing fetchers are known to return.
 */
const EXTERNAL_ID_TYPE_OPTIONS: SelectOption[] = [
    { value: "DOI", label: "DOI" },
    { value: "ARXIV", label: "ArXiv" },
    { value: "MAG", label: "MAG" },
    { value: "ACL", label: "ACL" },
    { value: "PUB_MED", label: "PubMed" },
    { value: "MEDLINE", label: "Medline" },
    { value: "PUB_MED_CENTRAL", label: "PubMed Central" },
    { value: "DBLP", label: "DBLP" },
    { value: "SEMANTIC_SCHOLAR", label: "Semantic Scholar" },
];

/**
 * Builds the URL of the page an external ID points to, keyed by external ID type. The value passed in
 * is already trimmed and URL-encoded (slashes are kept, as DOIs and DBLP keys contain them).
 *
 * MAG is missing on purpose: Microsoft Academic was shut down, so its IDs have no page to link to.
 */
const EXTERNAL_ID_URL_BUILDERS: Record<string, (value: string) => string> = {
    DOI: (value) => `https://doi.org/${value}`,
    ARXIV: (value) => `https://arxiv.org/abs/${value}`,
    ACL: (value) => `https://aclanthology.org/${value}`,
    PUB_MED: (value) => `https://pubmed.ncbi.nlm.nih.gov/${value}`,
    MEDLINE: (value) => `https://pubmed.ncbi.nlm.nih.gov/${value}`,
    PUB_MED_CENTRAL: (value) =>
        `https://pmc.ncbi.nlm.nih.gov/articles/PMC${value.replace(/^PMC/i, "")}`,
    DBLP: (value) => `https://dblp.org/rec/${value}`,
    SEMANTIC_SCHOLAR: (value) => `https://www.semanticscholar.org/paper/${value}`,
};

/**
 * Returns the URL of the page an external ID points to (e.g. `https://doi.org/<doi>` for a DOI), or
 * `undefined` if its type has no known page or its value is blank.
 */
function externalIdUrl(type: string, value: string): string | undefined {
    const buildUrl = EXTERNAL_ID_URL_BUILDERS[type];
    const trimmedValue = value.trim();
    if (buildUrl === undefined || trimmedValue === "") return undefined;

    const encodedValue = trimmedValue.split("/").map(encodeURIComponent).join("/");
    return buildUrl(encodedValue);
}

export { EXTERNAL_ID_TYPE_OPTIONS, externalIdUrl };
