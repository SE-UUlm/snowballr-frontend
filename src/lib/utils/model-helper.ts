import { Project_Paper } from "$api/project";
import type { Author, Paper } from "$api/paper";
import { getNames } from "./common-helper";
import type { StringifiedPaper } from "$lib/model/general";

function isProjectPaper(paper: Project_Paper | Paper): paper is Project_Paper {
    return "paper" in paper;
}

function asPaper(paper: Project_Paper | Paper): Paper {
    return isProjectPaper(paper) ? paper.paper! : paper;
}

function asProjectPaper(paper: Project_Paper | Paper): Project_Paper | undefined {
    return isProjectPaper(paper) ? paper : undefined;
}

function stringifyPaper(paper: Paper): StringifiedPaper {
    const stringifiedPaper = {} as StringifiedPaper;
    for (const key of Object.keys(paper)) {
        if (key === "externalIds") continue;

        const paperKey = key as keyof Omit<Paper, "externalIds">;
        if (key === "authors") {
            stringifiedPaper[paperKey] = getNames(paper[paperKey] as unknown as Author[], "; ");
        } else {
            stringifiedPaper[paperKey] = paper[paperKey].toString();
        }
    }
    stringifiedPaper.externalIds = paper.externalIds.map((externalId) => ({ ...externalId }));

    return stringifiedPaper;
}

export { asPaper, asProjectPaper, isProjectPaper, stringifyPaper };
