const SOURCE_EUROVEA = "https://www.cinemacity.sk/cinemas/eurovea/1012";
const SOURCE_AUPARK = "https://www.cinemacity.sk/cinemas/aupark/1010";

// Remove extra whitespace
function cleanText(text){
  return text.replace(/\s+/g, " ").trim();
}

async function loadHtmlJQuery(url) {
    try {
        return $.ajax({
                url: url,
                method: "GET",
                dataType: "text"
            });
    } catch (error) {
        console.error("Nepodarilo sa nacitat stranku: ", url, error);
        return null;
    }
}

function parseHtml(html){
    return DOMParser.parseFromString(html, "text/html");
}

async function main() {
    loadHtmlJQuery(SOURCE_AUPARK);
}

main();