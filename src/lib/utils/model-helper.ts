import { Project_Paper } from "$lib/model/api/project";
import type { Paper } from "$lib/model/api/paper";

function isProjectPaper(paper: Project_Paper | Paper): paper is Project_Paper {
    return "paper" in paper;
}

function asPaper(paper: Project_Paper | Paper): Paper {
    return isProjectPaper(paper) ? paper.paper! : paper;
}

function asProjectPaper(paper: Project_Paper | Paper): Project_Paper | undefined {
    return isProjectPaper(paper) ? paper : undefined;
}

export { asPaper, asProjectPaper, isProjectPaper };
