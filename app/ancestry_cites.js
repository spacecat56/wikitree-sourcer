import { extractData } from "../extension/site/ancestry/core/ancestry_extract_data.mjs";
import { generalizeData } from "../extension/site/ancestry/core/ancestry_generalize_data.mjs";
import { buildCitation } from "../extension/site/ancestry/core/ancestry_build_citation.mjs";
// import { buildHouseholdTable } from "../extension/base/core/table_builder.mjs";
import { getDefaultOptions } from "../extension/base/core/options/options_database.mjs";
import { fetchAncestrySharingDataObj } from "../extension/site/ancestry/browser/ancestry_fetch.mjs";

// this will take some work
// async function getSharingDataObj(){
//     try {
//         let response = await fetchAncestrySharingDataObj(data.extractedData);
    
//         if (response.success) {
//           ancestryPrefetch.prefetchedSharingDataObj = response.dataObj;
//         } else {
//           // It can fail even if there is an image URL, for example findagrave images:
//           // https://www.ancestry.com/discoveryui-content/view/2221897:60527
//           // This is not considered an error there just will be no sharing link
//         }
//       } catch (e) {
//         console.log("getAncestrySharingDataObj caught exception on fetchAncestrySharingDataObj:");
//         console.log(e);
//       }    
// }

export async function getCitation(doc) {
    console.log("Enter getCitation");
    console.log("Url is: " + doc.URL);

    let input = [];
    input.extractedData = extractData(doc, doc.URL);
    let rezult = await fetchAncestrySharingDataObj(input.extractedData);
    if (rezult.success) {
        input.sharingDataObj = rezult.dataObj;
    }
    input.generalizedData = generalizeData(input);
    
    input.runDate = new Date();
    input.type = "inline";

    // test this out
    // let realOptions = getDefaultOptions();
    // console.log("realOptions: ");
    // console.log(realOptions);
    // let optionsMock = [];
    // input.options = optionsMock;
    // optionsMock.citation_ancestry_subscriptionRequired = true;
    // optionsMock.citation_ancestry_dataStyle = "none";
    // optionsMock.citation_general_addBreaksWithinBody = true;
    // optionsMock.citation_general_dataListSeparator = "commaColon"; // "commaSpace"
    // optionsMock.citation_general_addAccessedDate = "parenAfterLink";
    // optionsMock.citation_ancestry_recordTemplateDomain = "default"; // "fromRecord"
    // optionsMock.citation_general_referencePosition = "atEnd";
    // optionsMock.citation_general_sourceReferenceSeparator = "commaColon"; // "commaSpace"

    input.options = getDefaultOptions();

    console.log("to call buildCitation with: ");
    console.log(input);
    let rv = buildCitation(input);
    console.log("return getCitation");
    console.log(rv);
    return rv.citation;
}


