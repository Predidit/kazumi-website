import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import fm from "front-matter";

const SECTION_ORDER = ["简介", "规则指南", "架构", "其他"];

interface Frontmatter {
	title: string;
	section: string;
	icon: string;
	order?: number;
	slug?: string;
}

interface PageEntry {
	route: string;
	title: string;
	icon: string;
	order: number;
}

function walkMd(dir: string): string[] {
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

const docsDir = join(import.meta.dirname, "../src/content/docs");
const files = walkMd(docsDir);
const sectionMap = new Map<string, PageEntry[]>();

for (const file of files) {
	const raw = readFileSync(file, "utf-8");
	const { attributes } = fm(raw);
	const a = attributes as Frontmatter;
	if (!a.title || !a.section) continue;

	const rel = relative(docsDir, file).replace(/\.md$/, "");
	const dir = rel.includes("/") ? rel.substring(0, rel.lastIndexOf("/")) : "";
	const base = a.slug || rel.split("/").pop()!;
	const route = dir ? `/docs/${dir}/${base}` : `/docs/${base}`;

	if (!sectionMap.has(a.section)) {
		sectionMap.set(a.section, []);
	}
	sectionMap.get(a.section)!.push({
		route,
		title: a.title,
		icon: a.icon,
		order: a.order ?? 999,
	});
}

for (const pages of sectionMap.values()) {
	pages.sort((x, y) => x.order - y.order);
}

const orderedNames: string[] = [];
for (const name of SECTION_ORDER) {
	if (sectionMap.has(name)) {
		orderedNames.push(name);
	}
}
for (const name of [...sectionMap.keys()].sort()) {
	if (!orderedNames.includes(name)) {
		orderedNames.push(name);
	}
}

const sections = orderedNames.map((title) => ({
	title,
	pages: (sectionMap.get(title) ?? []).map(({ route, title: t, icon }) => ({
		route,
		title: t,
		icon,
	})),
}));

writeFileSync("src/assets/doc-nav.json", JSON.stringify(sections, null, 2));
console.log("doc-nav.json:", sections.length, "sections");
