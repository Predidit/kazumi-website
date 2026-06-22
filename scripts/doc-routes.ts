import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import fm from "front-matter";

export const DOCS_DIR = join(import.meta.dirname, "../src/content/docs");

export function walkMd(dir: string): string[] {
	const entries = readdirSync(dir, { withFileTypes: true });
	const files: string[] = [];
	for (const entry of entries) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walkMd(full));
		} else if (entry.name.endsWith(".md")) {
			files.push(full);
		}
	}
	return files;
}

export function computeDocRoute(file: string): string {
	const raw = readFileSync(file, "utf-8");
	const { attributes } = fm(raw);
	const slug = (attributes as Record<string, string>).slug;
	const rel = relative(DOCS_DIR, file).replace(/\.md$/, "");
	const dir = rel.includes("/") ? rel.substring(0, rel.lastIndexOf("/")) : "";
	const base = slug || rel.split("/").pop() || "";
	return dir ? `/docs/${dir}/${base}` : `/docs/${base}`;
}
