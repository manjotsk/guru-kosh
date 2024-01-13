const fs = require("fs");
const path = require("path");
const process = require("process");

/**
 * Parses Gurmukhi text into a structured JSON format.
 * @param {string} text - The Gurmukhi text to be parsed.
 * @returns {Object[]} An array of parsed entries.
 */
function parseGurmukhiText(text) {
    const entries = text.split("\n");
    const json = [];
    let currentEntry = null;

    entries.forEach((entry) => {
        if (entry.includes(" -")) {
            currentEntry = {
                word: entry.split(" -")[0],
                meaning: entry.split("- ").pop(),
                examples: [],
                otherFaces: [],
            };
            json.push(currentEntry);
        } else if (entry) {
            handleSubEntries(entry, currentEntry);
        }
    });

    return json;
}

function handleSubEntries(entry, currentEntry) {
    if (!currentEntry) return;

    if (entry.includes(`“`) || entry.includes(`”`)) {
        currentEntry.examples.push({ line: entry });
    }
    if (entry.includes(`– `)) {
        const lastExample = currentEntry.examples[currentEntry.examples.length - 1];
        if (lastExample) lastExample.ref = entry;
    }
    if (entry.includes(` –`)) {
        currentEntry.otherFaces.push({
            word: entry.split(` –`)[0],
        });
    }
}

/**
 * Reads and parses a file containing Gurmukhi text.
 * @param {number} pageNumber - The page number to parse.
 * @returns {Promise<Object[]>} A promise that resolves to the parsed JSON data.
 */
function parsePage(pageNumber) {
    const filePath = path.join(__dirname, `text/${pageNumber}.txt`);

    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                console.error("Error reading the file:", err);
                reject(err);
                return;
            }

            const jsonData = parseGurmukhiText(data);
            resolve(jsonData);
        });
    });
}

/**
 * Main function to run the script.
 */
async function main() {
    const num = process.env.PAGE_NUMBER || null;

    if (!num) {
        let data = [];
        for (let i = 1; i <= 35; i++) {
            try {
                const jsondata = await parsePage(i);
                data = [...data, ...jsondata];
            } catch (error) {
                console.error(`Error parsing page ${i}:`, error);
            }
        }

        const outputFile = path.join(__dirname, "json/collection.json");
        fs.writeFile(outputFile, JSON.stringify(data, null, 2), "utf8", (writeErr) => {
            if (writeErr) {
                console.error("Error writing JSON to file:", writeErr);
                return;
            }
            console.log("JSON data saved to collection.json");
        });
    }
}

main();
