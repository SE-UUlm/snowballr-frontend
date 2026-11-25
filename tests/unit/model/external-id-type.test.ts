import { describe, expect, test } from "vitest";
import { externalIdUrl } from "#lib/model/external-id-type.js";

describe("externalIdUrl", () => {
    test("When the type is DOI, then the doi.org resolver URL is returned", () => {
        expect(externalIdUrl("DOI", "10.1109/ICST.2021.00012")).toBe(
            "https://doi.org/10.1109/ICST.2021.00012",
        );
    });

    test.each([
        ["ARXIV", "2002.12094", "https://arxiv.org/abs/2002.12094"],
        ["ACL", "2020.acl-main.447", "https://aclanthology.org/2020.acl-main.447"],
        ["PUB_MED", "32123456", "https://pubmed.ncbi.nlm.nih.gov/32123456"],
        ["MEDLINE", "32123456", "https://pubmed.ncbi.nlm.nih.gov/32123456"],
        ["PUB_MED_CENTRAL", "2323736", "https://pmc.ncbi.nlm.nih.gov/articles/PMC2323736"],
        ["DBLP", "conf/icse/Smith21", "https://dblp.org/rec/conf/icse/Smith21"],
        [
            "SEMANTIC_SCHOLAR",
            "3743d3cc7eb08ec037b1df896d731d42e384d0ea",
            "https://www.semanticscholar.org/paper/3743d3cc7eb08ec037b1df896d731d42e384d0ea",
        ],
    ])("When the type is %s, then its page URL is returned", (type, value, expected) => {
        expect(externalIdUrl(type, value)).toBe(expected);
    });

    test("When the type has no known page, then no URL is returned", () => {
        expect(externalIdUrl("MAG", "2963403868")).toBeUndefined();
        expect(externalIdUrl("SCOPUS", "12345")).toBeUndefined();
        expect(externalIdUrl("", "12345")).toBeUndefined();
    });

    test("When the value is blank, then no URL is returned", () => {
        expect(externalIdUrl("DOI", "")).toBeUndefined();
        expect(externalIdUrl("DOI", "   ")).toBeUndefined();
    });

    test("When the value has surrounding whitespace, then it is trimmed", () => {
        expect(externalIdUrl("DOI", " 10.1234/abc ")).toBe("https://doi.org/10.1234/abc");
    });

    test("When the value contains URL-special characters, then they are encoded but slashes are kept", () => {
        expect(externalIdUrl("DOI", "10.1002/(SICI)1097-4571#x?y")).toBe(
            "https://doi.org/10.1002/(SICI)1097-4571%23x%3Fy",
        );
    });

    test("When a PubMed Central ID already has the PMC prefix, then it is not duplicated", () => {
        expect(externalIdUrl("PUB_MED_CENTRAL", "PMC2323736")).toBe(
            "https://pmc.ncbi.nlm.nih.gov/articles/PMC2323736",
        );
    });
});
