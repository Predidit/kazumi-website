import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateUpstreamData } from "../.github/workflows/fetch-upstream-data";

const contributorsUrl =
	"https://api.github.com/repos/Predidit/Kazumi/contributors?per_page=100&page=1";
const kazumiUrl =
	"https://api.github.com/repos/Predidit/Kazumi/releases/latest";
const ohosUrl = "https://api.github.com/repos/ErBWs/Kazumi/releases/latest";
const secondPageUrl = contributorsUrl.replace("&page=1", "&page=2");

function contributor(login: string) {
	return {
		login,
		avatar_url: `https://github.com/${login}.png`,
		html_url: `https://github.com/${login}`,
	};
}

describe("upstream data updates", () => {
	let publicDirectory: string;
	let originalFiles: Record<string, string>;
	const fetchMock = vi.fn<typeof fetch>();

	function readJSON(filename: string) {
		return JSON.parse(readFileSync(join(publicDirectory, filename), "utf8"));
	}

	function expectUnchangedFiles() {
		for (const [filename, content] of Object.entries(originalFiles)) {
			expect(readFileSync(join(publicDirectory, filename), "utf8")).toBe(
				content,
			);
		}
	}

	function successfulResponse(url: string) {
		if (url === contributorsUrl) {
			return Response.json([
				contributor("Predidit"),
				contributor("ErBWs"),
				contributor("alice"),
			]);
		}
		if (url === kazumiUrl || url === ohosUrl) {
			return Response.json({ tag_name: "2.3.1" });
		}
		throw new Error(`Unexpected request: ${url}`);
	}

	beforeEach(() => {
		publicDirectory = mkdtempSync(join(tmpdir(), "kazumi-upstream-"));
		originalFiles = {
			"contributors.json": JSON.stringify({
				generated_at: "2026-09-01T00:00:00Z",
				count: 1,
				contributors: [
					{
						avatar: "https://github.com/previous.png",
						name: "previous",
						link: "https://github.com/previous",
					},
				],
			}),
			"releases.json": JSON.stringify({
				kazumi: {
					tag: "2.3.0",
					repo: "Predidit/Kazumi",
					timestamp: "2026-09-01T00:00:00Z",
				},
				ohos: {
					tag: "2.3.0",
					repo: "ErBWs/Kazumi",
					timestamp: "2026-09-01T00:00:00Z",
				},
			}),
		};
		for (const [filename, content] of Object.entries(originalFiles)) {
			writeFileSync(join(publicDirectory, filename), content);
		}
		fetchMock.mockReset();
		fetchMock.mockImplementation(async (input) =>
			successfulResponse(String(input)),
		);
		vi.stubGlobal("fetch", fetchMock);
		vi.stubEnv("GITHUB_TOKEN", "test-token");
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
		if (
			publicDirectory &&
			resolve(publicDirectory).startsWith(
				join(resolve(tmpdir()), "kazumi-upstream-"),
			)
		) {
			rmSync(publicDirectory, { recursive: true, force: true });
		}
	});

	it("writes the actual release tags and fetches each contributor page once with authentication", async () => {
		fetchMock.mockImplementation(async (input) => {
			const url = String(input);
			if (url === contributorsUrl) {
				return Response.json(
					[contributor("Predidit"), contributor("ERBWS"), contributor("alice")],
					{ headers: { Link: `<${secondPageUrl}>; rel="next"` } },
				);
			}
			if (url === secondPageUrl) return Response.json([contributor("bob")]);
			return successfulResponse(url);
		});

		await updateUpstreamData(publicDirectory);

		expect(readJSON("releases.json")).toMatchObject({
			kazumi: { tag: "2.3.1", repo: "Predidit/Kazumi" },
			ohos: { tag: "2.3.1", repo: "ErBWs/Kazumi" },
		});
		expect(readJSON("contributors.json")).toMatchObject({
			count: 2,
			contributors: [{ name: "alice" }, { name: "bob" }],
		});
		expect(fetchMock.mock.calls.map(([url]) => url).sort()).toEqual(
			[contributorsUrl, secondPageUrl, kazumiUrl, ohosUrl].sort(),
		);
		for (const [, options] of fetchMock.mock.calls) {
			expect(new Headers(options?.headers).get("Authorization")).toBe(
				"Bearer test-token",
			);
		}
	});

	it.each([
		[contributorsUrl, 403],
		[kazumiUrl, 403],
		[ohosUrl, 403],
		[kazumiUrl, 429],
		[kazumiUrl, 404],
		[kazumiUrl, 500],
	])("preserves both files when %s returns HTTP %i", async (endpoint, status) => {
		fetchMock.mockImplementation(async (input) =>
			String(input) === endpoint
				? Response.json({ message: "GitHub request failed" }, { status })
				: successfulResponse(String(input)),
		);

		await expect(updateUpstreamData(publicDirectory)).rejects.toThrow(
			String(status),
		);
		expectUnchangedFiles();
	});

	it("does not save a partial contributor list when a later page fails", async () => {
		fetchMock.mockImplementation(async (input) => {
			const url = String(input);
			if (url === contributorsUrl) {
				return Response.json([contributor("alice")], {
					headers: { Link: `<${secondPageUrl}>; rel="next"` },
				});
			}
			if (url === secondPageUrl)
				return new Response("Forbidden", { status: 403 });
			return successfulResponse(url);
		});

		await expect(updateUpstreamData(publicDirectory)).rejects.toThrow("403");
		expectUnchangedFiles();
	});

	it("preserves both files on a network failure", async () => {
		fetchMock.mockRejectedValue(new TypeError("fetch failed"));

		await expect(updateUpstreamData(publicDirectory)).rejects.toThrow(
			"fetch failed",
		);
		expectUnchangedFiles();
	});

	it.each([
		null,
		{},
		{ tag_name: "" },
		{ tag_name: "  " },
		{ tag_name: 231 },
	])("rejects invalid release data %j without overwriting either file", async (release) => {
		fetchMock.mockImplementation(async (input) =>
			String(input) === kazumiUrl
				? Response.json(release)
				: successfulResponse(String(input)),
		);

		await expect(updateUpstreamData(publicDirectory)).rejects.toThrow(
			"发布标签无效",
		);
		expectUnchangedFiles();
	});

	it.each([
		{ message: "Unexpected response" },
		[null],
		[{ login: "alice" }],
	])("rejects malformed contributor data %j without clearing the existing list", async (contributors) => {
		fetchMock.mockImplementation(async (input) =>
			String(input) === contributorsUrl
				? Response.json(contributors)
				: successfulResponse(String(input)),
		);

		await expect(updateUpstreamData(publicDirectory)).rejects.toThrow(
			"贡献者数据无效",
		);
		expectUnchangedFiles();
	});

	it.each([
		null,
		"invalid JSON",
	])("recreates missing or invalid cached data: %j", async (content) => {
		for (const filename of Object.keys(originalFiles)) {
			const path = join(publicDirectory, filename);
			if (content === null) rmSync(path);
			else writeFileSync(path, content);
		}

		await updateUpstreamData(publicDirectory);

		expect(readJSON("releases.json")).toMatchObject({
			kazumi: { tag: "2.3.1" },
			ohos: { tag: "2.3.1" },
		});
		expect(readJSON("contributors.json")).toMatchObject({
			count: 1,
			contributors: [{ name: "alice" }],
		});
	});

	it("keeps existing timestamps and file contents when upstream data is unchanged", async () => {
		await updateUpstreamData(publicDirectory);
		for (const filename of Object.keys(originalFiles)) {
			originalFiles[filename] = readFileSync(
				join(publicDirectory, filename),
				"utf8",
			);
		}
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));
		await updateUpstreamData(publicDirectory);
		expectUnchangedFiles();
	});

	it("omits authorization when no token is available for a local run", async () => {
		vi.stubEnv("GITHUB_TOKEN", undefined);

		await updateUpstreamData(publicDirectory);

		for (const [, options] of fetchMock.mock.calls) {
			expect(new Headers(options?.headers).has("Authorization")).toBe(false);
		}
	});
});
