/// <reference types="vitest" />

import analog from "@analogjs/platform";
import { defineConfig } from "vite";
import { sitemap } from "vite-plugin-sitemap-ts";
import { removeDocsContentRoutes } from "./scripts/filter-docs-content-routes";
import { getSitemapRoutes } from "./scripts/sitemap-routes";
import { SEO_CONFIG } from "./src/app/features/seo/seo.config";

function filterDocsContentRoutes() {
	return {
		name: "filter-docs-content-routes",
		enforce: "post" as const,
		transform(code: string, id: string) {
			if (
				!id.replace(/\\/g, "/").includes("@analogjs/router") ||
				!code.includes("ANALOG_CONTENT_ROUTE_FILES")
			) {
				return;
			}
			return removeDocsContentRoutes(code);
		},
	};
}

export default defineConfig(() => {
	const routes = getSitemapRoutes();
	return {
		build: {
			target: ["es2020"],
		},
		resolve: {
			mainFields: ["module"],
		},
		plugins: [
			analog({ prerender: { routes: routes.map(({ loc }) => loc) } }),
			filterDocsContentRoutes(),
			sitemap({
				hostname: SEO_CONFIG.siteUrl,
				outDir: "dist/client",
				routes,
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
	};
});
