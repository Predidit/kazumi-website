/// <reference types="vitest" />

import analog from "@analogjs/platform";
import markedAlert from "marked-alert";
import { defineConfig } from "vite";

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
					"/docs/intro/what-is-kazumi",
					"/docs/intro/how-to-download",
					"/docs/intro/screenshots",
					"/docs/intro/module-details",
					"/docs/rules/introduce-rules",
					"/docs/rules/develop-rules",
					"/docs/rules/develop-rules-example",
					"/docs/architecture/video-parser",
					"/docs/architecture/bbcode",
					"/docs/misc/qa",
					"/docs/misc/how-to-install-in-ios",
					"/docs/misc/how-to-install-in-ohos",
				],
			},
		}),
	],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["src/test-setup.ts"],
		include: ["**/*.spec.ts"],
		reporters: ["default"],
	},
}));
