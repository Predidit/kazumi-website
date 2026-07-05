import { execSync } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const docsDir = "src/content/docs";
const output: Record<string, string> = {};

function walk(dir: string) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			walk(full);
		} else if (entry.name.endsWith(".md")) {
			try {
				const ts = execSync(`git log -1 --format=%ct -- "${full}"`, {
					encoding: "utf-8",
				}).trim();
				if (ts) {
					const d = new Date(Number(ts) * 1000);
					const key =
						"/docs/" +
						relative(docsDir, full).replace(/\.md$/, "").replace(/\\/g, "/");
					const pad = (n: number) => String(n).padStart(2, "0");
					output[key] =
						`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
						`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
				}
			} catch {
				// file not tracked by git, skip
			}
		}
	}
}

walk(docsDir);
writeFileSync("public/doc-updates.json", JSON.stringify(output, null, "\t"));
console.log("doc-updates.json:", Object.keys(output).length, "entries");
