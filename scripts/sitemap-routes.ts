import { relative, resolve } from "node:path";
import type { SitemapEntry } from "vite-plugin-sitemap-ts";
import { computeDocRoute, DOCS_DIR, walkMd } from "./doc-routes";

import { getLastModified } from "./git-history";

const PROJECT_ROOT = resolve(import.meta.dirname, "..");
const SHARED_SOURCES = [
	"index.html",
	"src/app/features/seo/seo.config.ts",
	"src/app/features/seo/seo.service.ts",
];

export function getSitemapRoutes(): SitemapEntry[] {
	const pages = [
		{
			loc: "/",
			sources: [
				"src/app/pages/index.page.ts",
				"src/app/features/home/hero.ts",
				"public/kazumi-expressive.png",
			],
		},
		{
			loc: "/download",
			sources: [
				"src/app/pages/download.page.ts",
				"src/app/features/download/platforms.ts",
				"public/releases.json",
			],
		},
		{
			loc: "/docs",
			sources: ["src/app/pages/docs/index.page.ts", "src/content/docs"],
		},
		{
			loc: "/about",
			sources: [
				"src/app/pages/about/index.page.ts",
				"src/app/features/home/contributors.ts",
				"public/contributors.json",
			],
		},
		{
			loc: "/about/icon",
			sources: [
				"src/app/pages/about/icon.page.ts",
				"public/kazumi-expressive.png",
			],
		},
		...walkMd(DOCS_DIR).map((file) => ({
			loc: computeDocRoute(file),
			sources: [
				relative(PROJECT_ROOT, file).replace(/\\/g, "/"),
				"src/app/pages/docs/[...slug].page.ts",
				"src/app/features/docs/doc-renderer.ts",
			],
		})),
	];
	return pages.map(({ loc, sources }) => ({
		loc,
		lastmod: getLastModified([...sources, ...SHARED_SOURCES]),
	}));
}
