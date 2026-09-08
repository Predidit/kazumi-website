import { writeFileSync } from "node:fs";
import { computeDocRoute, DOCS_DIR, walkMd } from "./doc-routes";
import { getLastModified } from "./git-history";

const output: Record<string, string> = {};
for (const file of walkMd(DOCS_DIR)) {
	const date = getLastModified([file]);
	if (date) output[computeDocRoute(file)] = date;
}
writeFileSync("public/doc-updates.json", JSON.stringify(output, null, "\t"));
console.log("doc-updates.json:", Object.keys(output).length, "entries");
