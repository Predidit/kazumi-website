import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { computeDocRoute, DOCS_DIR, walkMd } from "./doc-routes";
import { getLastModified } from "./git-history";
import { getSitemapRoutes } from "./sitemap-routes";

describe("sitemap modification dates", () => {
	let repository: string;
	const firstDate = "2024-01-02T03:04:05Z";
	const secondDate = "2025-02-03T04:05:06Z";
	const git = (args: string[], date?: string) =>
		execFileSync("git", args, {
			cwd: repository,
			env: date
				? { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date }
				: process.env,
			stdio: "ignore",
		});

	beforeAll(() => {
		repository = mkdtempSync(join(tmpdir(), "kazumi-seo-"));
		git(["init"]);
		writeFileSync(join(repository, "[...slug].page.ts"), "document content");
		git(["add", "."]);
		git(
			[
				"-c",
				"user.name=SEO test",
				"-c",
				"user.email=seo@example.invalid",
				"commit",
				"-m",
				"Add document",
			],
			firstDate,
		);
		writeFileSync(join(repository, "unrelated.txt"), "unrelated change");
		git(["add", "."]);
		git(
			[
				"-c",
				"user.name=SEO test",
				"-c",
				"user.email=seo@example.invalid",
				"commit",
				"-m",
				"Unrelated update",
			],
			secondDate,
		);
	});

	afterAll(() => {
		if (
			repository &&
			resolve(repository).startsWith(join(resolve(tmpdir()), "kazumi-seo-"))
		) {
			rmSync(repository, { recursive: true, force: true });
		}
	});

	it("uses the relevant file history rather than the build date or latest unrelated commit", () => {
		expect(
			new Date(
				getLastModified(["[...slug].page.ts"], repository),
			).toISOString(),
		).toBe(new Date(firstDate).toISOString());
		expect(
			new Date(
				getLastModified(["[...slug].page.ts", "unrelated.txt"], repository),
			).toISOString(),
		).toBe(new Date(secondDate).toISOString());
	});

	it("omits dates when no reliable file history exists", () => {
		expect(getLastModified(["untracked.md"], repository)).toBe("");
		expect(
			getLastModified(["file.md"], join(repository, "missing-directory")),
		).toBe("");
	});

	it("includes every document route once and excludes error pages", () => {
		const routes = getSitemapRoutes().map((entry) => entry.loc);
		expect(new Set(routes).size).toBe(routes.length);
		expect(routes).toEqual(
			expect.arrayContaining([
				"/",
				"/download",
				"/docs",
				"/about",
				"/about/icon",
				...walkMd(DOCS_DIR).map(computeDocRoute),
			]),
		);
		expect(
			routes.some(
				(route) => route.includes("404") || route.includes("not-found"),
			),
		).toBe(false);
	});
});
