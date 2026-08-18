import type { SelectOption } from "$lib/model/select-option";

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

export { EXTERNAL_ID_TYPE_OPTIONS };
