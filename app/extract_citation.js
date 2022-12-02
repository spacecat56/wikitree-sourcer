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
// NB a few places in the extension need to be modified, mininimally 
// to catch and swallow execptions, because the browser stack calls 
// apis that are not acessible in the CEF environment.

import { extractData as ancEx } from "../extension/site/ancestry/core/ancestry_extract_data.mjs";
import { generalizeData as ancGd } from "../extension/site/ancestry/core/ancestry_generalize_data.mjs";
import { buildCitation as ancBc } from "../extension/site/ancestry/core/ancestry_build_citation.mjs";
// import { buildHouseholdTable } from "../extension/base/core/table_builder.mjs";
import { getDefaultOptions } from "../extension/base/core/options/options_database.mjs";
import { fetchAncestrySharingDataObj } from "../extension/site/ancestry/browser/ancestry_fetch.mjs";

import { extractData as fgEx } from "../extension/site/fg/core/fg_extract_data.mjs";
import { generalizeData as fgGd } from "../extension/site/fg/core/fg_generalize_data.mjs";
import { buildCitation as fgBc } from "../extension/site/fg/core/fg_build_citation.mjs";

import { extractDataFromFetch as fsExFetch, extractData as fsEx } from "../extension/site/fs/core/fs_extract_data.mjs";
import { generalizeData as fsGd } from "../extension/site/fs/core/fs_generalize_data.mjs";
import { buildCitation as fsBc} from "../extension/site/fs/core/fs_build_citation.mjs";
import { doFetch as fsDoFetch } from "../extension/site/fs/browser/fs_content.js";
//import { buildHouseholdTable } from "../../extension/base/core/table_builder.mjs";

// control excess console loggin in this file scope
var excdbg = false;

// this serves for operations that use the two-arg
// extractData() function for the site
// including ancestry where it will also do sharing data
async function execExtractData(doc, input, fnEx, fnSd) {
    input.extractedData = fnEx(doc, doc.URL);

    if (fnSd) {
        let rezult = await fnSd(input.extractedData);
        if (rezult.success) {
            input.sharingDataObj = rezult.dataObj;
        }
    }
}

// this serves for all sites that use standard generalize()
// and buid() functions on the inoput data
function generalizeAndBuild(input, fnGd, fnBc) {
    if (excdbg) console.log("generalizeAndBuild() to call generalizeData with input:");
    if (excdbg) console.log(input);
    input.generalizedData = fnGd(input);

    if (excdbg) console.log("generalizeAndBuild() to call buildCitation with input:");
    if (excdbg) console.log(input);
    let rv = fnBc(input);
    return rv;
}

// if all three steps are standard this will serve
async function getThisCite(doc, input, fnEx, fnGd, fnBc, fnSd) {
    await execExtractData(doc, input, fnEx, fnSd);
    return generalizeAndBuild(input, fnGd, fnBc);
}

export async function getCitationFor(doc, options = null, dbg = false) {
    console.log("Enter getCitationFor: " + doc.URL + " debug=" + dbg);
    excdbg = dbg;

    if (options) {
        if (excdbg) console.log("options:");
        if (excdbg) console.log(options);
    }

    let domain = (new URL(doc.URL));
    let hostname = domain.hostname;
    let path = domain.pathname;

    let input = [];
    input.runDate = new Date();
    input.type = "inline";
    input.options = getDefaultOptions();
    if (options) {
        // apply any option overrides
        for (var i = 0; i < options.length; i += 2) {
            if (options[i] === "type")
                input.type = options[i + 1];
            else
                input.options[options[i]] = options[i + 1];
        }
    }

    let rv = {url: doc.URL, message: "unrecognized hostname " + hostname, citation: null};

    let citationObject = null;
    if (hostname.includes("ancestry.")) {
        citationObject = await getThisCite(doc, input, ancEx, ancGd, ancBc, fetchAncestrySharingDataObj);
    } else if (hostname.includes("findagrave.")) {
        citationObject = await getThisCite(doc, input, fgEx, fgGd, fgBc, null);
    } else if (hostname.includes("familysearch.org")) {
        if (path.startsWith("/ark:/61903/3:1:")) {
            if (excdbg) console.log("familysearch image");
            citationObject = await getThisCite(doc, input, fsEx, fsGd, fsBc, null);
        } else if (path.startsWith("/ark:/61903/1:1:")) {
            if (excdbg) console.log("familysearch record");
            let fetchResult = await fsDoFetch();
            if (!fetchResult.success) {
                if (excdbg) console.log("familysearch doFetch failed");
                rv.message += "; fetch failed";
                return rv;
            }
            if (excdbg) {
                console.log("result from doFetch:");
                console.log(fetchResult);
            }
            input.extractedData = fsExFetch(doc, fetchResult.dataObj, fetchResult.fetchType, options);
            if (excdbg) {
                console.log("extractedData from fsFetchEx:");
                console.log(input.extractedData);
            }
            citationObject = generalizeAndBuild(input, fsGd, fsBc);
        }
    }

    if (citationObject == null) {
        if (excdbg) console.log(rv.message);
        return rv;
    }

    rv.citation = citationObject.citation;
    rv.message = "returning citation of type: " + citationObject.type;
    console.log("getCitationFor returns:");
    console.log(rv);
    return rv;
}



