/*
MIT License

Copyright (c) 2022 Thomas W Shanley

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// provides functional interface for selected capabilites in the extension 
// code when (webpack) packed as a module.

import { extractData } from "../extension/site/ancestry/core/ancestry_extract_data.mjs";
import { generalizeData } from "../extension/site/ancestry/core/ancestry_generalize_data.mjs";
import { buildCitation } from "../extension/site/ancestry/core/ancestry_build_citation.mjs";
// import { buildHouseholdTable } from "../extension/base/core/table_builder.mjs";
import { getDefaultOptions } from "../extension/base/core/options/options_database.mjs";
import { fetchAncestrySharingDataObj } from "../extension/site/ancestry/browser/ancestry_fetch.mjs";

import { extractData as fgEx } from "../extension/site/fg/core/fg_extract_data.mjs";
import { generalizeData as fgGd } from "../extension/site/fg/core/fg_generalize_data.mjs";
import { buildCitation as fgBc } from "../extension/site/fg/core/fg_build_citation.mjs";

async function getThisCite(doc, input, fnEx, fnGd, fnBc, fnSd) {
    input.extractedData = fnEx(doc, doc.URL);

    if (fnSd) {
        let rezult = await fnSd(input.extractedData);
        if (rezult.success) {
            input.sharingDataObj = rezult.dataObj;
        }
    }

    input.generalizedData = fnGd(input);

    console.log("to call buildCitation with input:");
    console.log(input);
    let rv = fnBc(input);
    return rv;
}

export async function getCitationFor(doc) {
    console.log("Enter getCitationFor: " + doc.URL);

    let domain = (new URL(doc.URL));
    let hostname = domain.hostname;

    let input = [];
    input.runDate = new Date();
    input.type = "inline";
    input.options = getDefaultOptions();

    let rv = {url: doc.URL, message: "unrecognized hostname " + hostname, citation: null};
    //let rv["message"] = "unrecognized hostname " + hostname;

    let citationObject = null;
    if (hostname.includes("ancestry."))
        citationObject = await getThisCite(doc, input, extractData, generalizeData, buildCitation, fetchAncestrySharingDataObj);
    else if (hostname.includes("findagrave."))
        citationObject = await getThisCite(doc, input, fgEx, fgGd, fgBc, null);
    else
        return rv;

    rv.citation = citationObject.citation;
    rv.message = "returning citation of type: " + citationObject.type;
    console.log("getCitationFor returns:");
    console.log(rv);
    return rv;
}



