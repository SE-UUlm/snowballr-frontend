import type { Paper } from "$lib/model/backend";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
    const paperId = Number(params.paperId);
    if (Number.isNaN(paperId)) {
        throw new Error(`Invalid paperId ${params.paperId}`);
    }
    const paper: Paper = {
        doi: "Doi",
        id: paperId,
        title: "Field-Sensitive Pointer Analysis for Static Dataflow in the R Programming Language",
        abstrakt: `Context Many researchers rely on the R programming language to perform their statistical analyses and visualizations in the form of R scripts. However, recent research and experience show, that many of these scripts contain problems. From being hard to comprehend by combining several analyses and plots into a single source file to being non-reproducible, with a lack of analysis tools supporting the writing of correct and maintainable code. Objective In this work, we address the problem of comprehending and maintaining R scripts by proposing flowR, a program slicer and static dataflow analyzer for the R programming language, which can be integrated directly into Visual Studio Code. Given a set of variables of interest, like the generation of a single figure in a script, flowR automatically reduces the program to the parts relevant for the output of interest, like the value of a variable. Method First, we use static program analysis to construct a detailed dataflow graph of the R script. The analysis supports loops, function calls, side effects, sourcing external files, and even redefinitions of R's primitive constructs. Subsequently, we calculate the program slice by solving a reachability problem on the graph, collecting all required parts and presenting them to the user. Results Providing several interactive ways of slicing the program, we require an average of 16 ms to calculate the slice on a given dataflow graph, reducing the code by around 94% of tokens.

The demonstration video is available at https://youtu.be/Zgq6rnbvvhk. For the full source code and extensive documentation, refer to https://github.com/Code-Inspect/flowr. To try the docker image, use docker run -rm -it eagleoutice/flowr.`,
        year: 2015,
        type: "Paper",
        authors: [
            { id: 0, firstName: "Foo", lastName: "Bar", orcid: "" },
            { id: 1, firstName: "Foo", lastName: "Bar", orcid: "" },
            { id: 2, firstName: "Foo", lastName: "Bar", orcid: "" },
            { id: 3, firstName: "Foo", lastName: "Bar", orcid: "" },
            { id: 4, firstName: "Foo", lastName: "Bar", orcid: "" },
        ],
        backwardReferencedPaperIds: [],
        forwardReferencedPaperIds: [],
    };
    return {
        paper,
        isReviewMode: true,
    };
};
