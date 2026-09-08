import { describe, expect, it } from "vitest";
import { removeDocsContentRoutes } from "./filter-docs-content-routes";

describe("document route filtering", () => {
	it.each([
		`"/src/content/docs/intro/guide.md": () => import('D:/app/src/content/docs/intro/guide.md?analog-content-file=true').then(m => m.default),`,
		`"/src/content/docs/intro/guide.md": () => import("D:/app/src/content/docs/intro/guide.md?analog-content-file=true").then((m) => m.default),`,
	])("removes the default renderer in both build and development transforms", (entry) => {
		const other = `"/src/content/blog/post.md": () => import('/src/content/blog/post.md').then(m => m.default)`;
		const code = `const ANALOG_CONTENT_ROUTE_FILES = {${entry}${other}};`;
		expect(removeDocsContentRoutes(code)).toBe(
			`const ANALOG_CONTENT_ROUTE_FILES = {${other}};`,
		);
	});
});
