import { readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

interface Contributor {
	avatar: string;
	name: string;
	link: string;
}

interface ReleaseInfo {
	tag: string;
	repo: string;
}

interface ReleaseData {
	kazumi: ReleaseInfo & { timestamp: string };
	ohos: ReleaseInfo & { timestamp: string };
}

interface ContributorsData {
	generated_at: string;
	count: number;
	contributors: Contributor[];
}

const KAZUMI_REPO = "Predidit/Kazumi";
const OHOS_REPO = "ErBWs/Kazumi";
const CONTRIBUTORS_API = `https://api.github.com/repos/${KAZUMI_REPO}/contributors`;
const PER_PAGE = 100;

const EXCLUDED_LOGINS = new Set(["predidit", "erbws"]);

async function fetchGitHubAPI(endpoint: string): Promise<Response> {
	try {
		const { GITHUB_TOKEN: token } = process.env;
		const response = await fetch(endpoint, {
			headers: {
				Accept: "application/vnd.github.v3+json",
				"User-Agent": "Kazumi-Website-Fetcher",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			signal: AbortSignal.timeout(30_000),
		});
		if (!response.ok) {
			throw new Error(
				`请求失败: ${response.status} ${response.statusText}; ${await response.text()}`,
			);
		}
		return response;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`请求 ${endpoint} 失败: ${message}`, { cause: error });
	}
}

async function fetchAllContributors(): Promise<Contributor[]> {
	const contributors: Contributor[] = [];
	for (let page = 1; ; page++) {
		const response = await fetchGitHubAPI(
			`${CONTRIBUTORS_API}?per_page=${PER_PAGE}&page=${page}`,
		);
		const data: unknown = await response.json();
		if (!Array.isArray(data)) {
			throw new Error("GitHub 返回的贡献者数据无效");
		}
		for (const contributor of data) {
			if (
				typeof contributor?.login !== "string" ||
				typeof contributor?.avatar_url !== "string" ||
				typeof contributor?.html_url !== "string"
			) {
				throw new Error("GitHub 返回的贡献者数据无效");
			}
			if (EXCLUDED_LOGINS.has(contributor.login.toLowerCase())) continue;
			contributors.push({
				avatar: contributor.avatar_url,
				name: contributor.login,
				link: contributor.html_url,
			});
		}
		if (!response.headers.get("Link")?.includes('rel="next"')) break;
	}

	return contributors;
}

async function fetchLatestRelease(repo: string): Promise<ReleaseInfo> {
	const response = await fetchGitHubAPI(
		`https://api.github.com/repos/${repo}/releases/latest`,
	);
	const data: unknown = await response.json();
	if (
		!data ||
		typeof data !== "object" ||
		!("tag_name" in data) ||
		typeof data.tag_name !== "string" ||
		!data.tag_name.trim()
	) {
		throw new Error(`${repo} 返回的发布标签无效`);
	}
	return { tag: data.tag_name, repo };
}

function readJSONSafe(path: string): unknown {
	try {
		return JSON.parse(readFileSync(path, "utf8"));
	} catch {
		return null;
	}
}

function writeDataIfChanged(
	path: string,
	data: ContributorsData | ReleaseData,
): void {
	// Ignore fetch timestamps to avoid commits for unchanged upstream data.
	const withoutTimestamps = (key: string, value: unknown) =>
		key === "generated_at" || key === "timestamp" ? undefined : value;
	const changed =
		JSON.stringify(data, withoutTimestamps) !==
		JSON.stringify(readJSONSafe(path), withoutTimestamps);
	if (changed) {
		writeFileSync(path, `${JSON.stringify(data, null, "\t")}\n`, "utf8");
	}
	console.log(`${basename(path)}${changed ? "已更新" : "未变化"}`);
}

export async function updateUpstreamData(
	publicDirectory = fileURLToPath(new URL("../../public", import.meta.url)),
): Promise<void> {
	console.log("开始获取所有数据...");

	// Complete every upstream request before writing either file.
	const [contributors, kazumiRelease, ohosRelease] = await Promise.all([
		fetchAllContributors(),
		fetchLatestRelease(KAZUMI_REPO),
		fetchLatestRelease(OHOS_REPO),
	]);

	const timestamp = new Date().toISOString();
	writeDataIfChanged(join(publicDirectory, "contributors.json"), {
		generated_at: timestamp,
		count: contributors.length,
		contributors,
	});
	writeDataIfChanged(join(publicDirectory, "releases.json"), {
		kazumi: { ...kazumiRelease, timestamp },
		ohos: { ...ohosRelease, timestamp },
	});

	console.log("\n数据获取完成:");
	console.log(`- 贡献者数量: ${contributors.length}`);
	console.log(`- Kazumi 最新版本: ${kazumiRelease.tag}`);
	console.log(`- OHOS 最新版本: ${ohosRelease.tag}`);
}

if (import.meta.main) {
	updateUpstreamData().catch((error) => {
		const message = error instanceof Error ? error.message : String(error);
		console.error("脚本执行失败:", message);
		process.exitCode = 1;
	});
}
