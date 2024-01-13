const fs = require("fs");
const num = process.argv[2];
console.log(process.argv);
function parseGurmukhiText(text) {
  const entries = text.split("\n");
  const json = [];
  let j = -1;
  entries.forEach((entry, index) => {
    if (entry.includes(" -")) {
      j++;
      json[j] = {
        word: entry.split(" -")[0],
        meaning: entry.split("- ").reverse()[0],
        examples: [],
        otherFaces: [],
      };
      return;
    }
    if (entry && !entry.includes("page")) {
      if (entry.includes(`“`) || entry.includes(`”`)) {
        json?.[j]?.examples?.push({ line: entry });
      }
      if (entry.includes(`– `)) {
        let length = json?.[j]?.examples?.length;
        if (json[j].examples[length - 1])
          json[j].examples[length - 1].ref = entry;
      }
      if (entry.includes(` –`)) {
        json?.[j]?.otherFaces?.push({
            word:entry.split(` –`)[0]
        });
        // if (entry.includes(`“`) || entry.includes(`”`)) {
        //     console.log("yoyo");
        //   let length = json?.[j]?.otherFaces?.length;

        //   json[j].otherFaces[length - 1].line = entry;
        // }
      }
    }
  });
  return json;
}

if (!num) {
  for (i = 1; i < 36; i++) parsePage(i);
}

function parsePage(pageNumber) {
  // Usage
  const filePath = `text/${pageNumber}.txt`; // Replace with the path to your file

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }

    const jsonData = parseGurmukhiText(data);
    // console.log(JSON.stringify(jsonData, null, 2));

    // Optionally, you can also write this JSON to a file
    fs.writeFile(
      `json/${pageNumber}.json`,
      JSON.stringify(jsonData, null, 2),
      "utf8",
      (writeErr) => {
        if (writeErr) {
          console.error("Error writing JSON to file:", writeErr);
        } else {
          console.log("JSON data saved to output.json");
        }
      }
    );
  });
}
