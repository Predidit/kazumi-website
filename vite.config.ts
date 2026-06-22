/// <reference types="vitest" />

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import analog, { type PrerenderContentFile } from "@analogjs/platform";
import fm from "front-matter";
import { gfmAlert } from "marked-gfm-alert";
import { sitemap } from "vite-plugin-sitemap-ts";
import { defineConfig } from "vite";

function getDocRoutes(): string[] {
	const docsDir = join(import.meta.dirname, "src/content/docs");
	const files = walkMd(docsDir);
	return files.map((file) => {
		const raw = readFileSync(file, "utf-8");
		const { attributes } = fm(raw);
		const slug = (attributes as Record<string, string>).slug;
		const rel = relative(docsDir, file).replace(/\.md$/, "");
		const dir = rel.includes("/") ? rel.substring(0, rel.lastIndexOf("/")) : "";
		const base = slug || rel.split("/").pop()!;
		return dir ? `/docs/${dir}/${base}` : `/docs/${base}`;
	});
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

function filterDocsContentRoutes() {
	return {
		name: "filter-docs-content-routes",
		enforce: "post" as const,
		transform(code: string, id: string) {
			if (
				!id.includes("@analogjs/router") ||
				!code.includes("ANALOG_CONTENT_ROUTE_FILES")
			) {
				return;
			}

			return code.replace(
				/"[^"]*\/src\/content\/docs\/[^"]+\.md":\s*\(\) => import\('[^']+'\)\.then\(m => m\.default\),?/g,
				"",
			);
		},
	};
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
	build: {
		target: ["es2020"],
	},
	resolve: {
		mainFields: ["module"],
	},
	plugins: [
		analog({
			content: {
				highlighter: "prism",
				prismOptions: {
					additionalLangs: ["dart"],
				},
				markedOptions: {
					extensions: [gfmAlert({ inlineStyles: true })],
				},
			},
			prerender: {
				routes: [
					"/",
					"/download",
					"/about/icon",
					{
						contentDir: "src/content/docs",
						recursive: true,
						transform: (file: PrerenderContentFile) => {
							if (file.extension !== "md") {
								return false;
							}
							const slug = file.attributes.slug || file.name;
							return file.relativePath
								? `/docs/${file.relativePath}/${slug}`
								: `/docs/${slug}`;
						},
					},
				],
			},
		}),
		filterDocsContentRoutes(),
		sitemap({
			hostname: "https://kazumi.app",
			outDir: "dist/client",
			routes: ["/", "/download", "/about/icon", ...getDocRoutes()],
		}),
	],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["src/test-setup.ts"],
		include: ["**/*.spec.ts"],
		exclude: ["**/node_modules/**", "**/.git/**", "dist/**"],
		reporters: ["default"],
	},
}));
