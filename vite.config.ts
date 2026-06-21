/// <reference types="vitest" />

import analog, { type PrerenderContentFile } from "@analogjs/platform";
import markedAlert from "marked-alert";
import { defineConfig } from "vite";

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
					extensions: [markedAlert()],
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
