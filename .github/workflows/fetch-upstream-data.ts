import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// --- Types ---

interface Contributor {
	avatar: string;
	name: string;
	link: string;
}

interface GitHubContributor {
	login: string;
	avatar_url: string;
	html_url: string;
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

// --- Constants ---

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const KAZUMI_REPO = "Predidit/Kazumi";
const OHOS_REPO = "ErBWs/Kazumi";
const CONTRIBUTORS_API = `https://api.github.com/repos/${KAZUMI_REPO}/contributors`;
const PER_PAGE = 100;

const EXCLUDED_LOGINS = new Set(["predidit", "erbws"]);

// --- GitHub API ---

async function fetchGitHubAPI<T = unknown>(endpoint: string): Promise<T> {
	try {
		const response = await fetch(endpoint, {
			headers: {
				Accept: "application/vnd.github.v3+json",
				"User-Agent": "Kazumi-Website-Fetcher",
			},
		});
		if (!response.ok) throw new Error(`请求失败: ${response.status}`);
		return (await response.json()) as T;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`请求 ${endpoint} 失败:`, message);
		throw error;
	}
}

// --- Contributors ---

async function fetchAllContributors(): Promise<Contributor[]> {
	const contributors: Contributor[] = [];
	let page = 1;
	let hasNextPage = true;

	console.log("开始获取贡献者数据...");

	while (hasNextPage) {
		try {
			const data = await fetchGitHubAPI<GitHubContributor[]>(
				`${CONTRIBUTORS_API}?per_page=${PER_PAGE}&page=${page}`,
			);
			if (!data.length) break;

			const filtered = data
				.filter((c) => !EXCLUDED_LOGINS.has(c.login.toLowerCase()))
				.map(
					(c): Contributor => ({
						avatar: c.avatar_url,
						name: c.login,
						link: c.html_url,
					}),
				);

			contributors.push(...filtered);
			console.log(`获取了 ${filtered.length} 个贡献者`);

			// Check for next page via Link header
			const linkResponse = await fetch(
				`${CONTRIBUTORS_API}?per_page=${PER_PAGE}&page=${page}`,
			);
			const linkHeader = linkResponse.headers.get("Link");
			hasNextPage = linkHeader?.includes('rel="next"') ?? false;
			page++;
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error("获取贡献者数据时出错:", message);
			break;
		}
	}

	console.log(`总共获取了 ${contributors.length} 个贡献者`);
	return contributors;
}

// --- Releases ---

async function fetchLatestRelease(repo: string): Promise<ReleaseInfo> {
	try {
		console.log(`获取 ${repo} 的最新发布...`);
		const data = await fetchGitHubAPI<{ tag_name: string }>(
			`https://api.github.com/repos/${repo}/releases/latest`,
		);
		return { tag: data.tag_name, repo };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`获取 ${repo} 的最新发布失败，使用默认值:`, message);
		return { tag: "v1.0.0", repo };
	}
}

// --- Data comparison ---

function isDataEqual(newData: unknown, oldData: unknown): boolean {
	if (!oldData) return false;

	const newCopy = JSON.parse(JSON.stringify(newData)) as Record<
		string,
		unknown
	>;
	const oldCopy = JSON.parse(JSON.stringify(oldData)) as Record<
		string,
		unknown
	>;

	delete newCopy.generated_at;
	delete oldCopy.generated_at;

	const newKazumi = newCopy.kazumi as Record<string, unknown> | undefined;
	const oldKazumi = oldCopy.kazumi as Record<string, unknown> | undefined;
	if (newKazumi) delete newKazumi.timestamp;
	if (oldKazumi) delete oldKazumi.timestamp;

	const newOhos = newCopy.ohos as Record<string, unknown> | undefined;
	const oldOhos = oldCopy.ohos as Record<string, unknown> | undefined;
	if (newOhos) delete newOhos.timestamp;
	if (oldOhos) delete oldOhos.timestamp;

	return JSON.stringify(newCopy) === JSON.stringify(oldCopy);
}

// --- File I/O ---

function readJSONSafe<T>(path: string): T | null {
	if (!existsSync(path)) return null;
	try {
		return JSON.parse(readFileSync(path, "utf8")) as T;
	} catch {
		return null;
	}
}

// --- Main ---

async function main(): Promise<void> {
	try {
		console.log("开始获取所有数据...");

		const [contributors, kazumiRelease, ohosRelease] = await Promise.all([
			fetchAllContributors(),
			fetchLatestRelease(KAZUMI_REPO),
			fetchLatestRelease(OHOS_REPO),
		]);

		const contributorsPath = join(
			__dirname,
			"..",
			"..",
			"public",
			"contributors.json",
		);
		const releasesPath = join(__dirname, "..", "..", "public", "releases.json");

		const newContributorsData: ContributorsData = {
			generated_at: new Date().toISOString(),
			count: contributors.length,
			contributors,
		};

		const newReleasesData: ReleaseData = {
			kazumi: { ...kazumiRelease, timestamp: new Date().toISOString() },
			ohos: { ...ohosRelease, timestamp: new Date().toISOString() },
		};

		const oldContributorsData =
			readJSONSafe<ContributorsData>(contributorsPath);
		const oldReleasesData = readJSONSafe<ReleaseData>(releasesPath);

		const contributorsChanged = !isDataEqual(
			newContributorsData,
			oldContributorsData,
		);
		const releasesChanged = !isDataEqual(newReleasesData, oldReleasesData);

		if (contributorsChanged) {
			writeFileSync(
				contributorsPath,
				`${JSON.stringify(newContributorsData, null, "\t")}\n`,
				"utf8",
			);
			console.log(`贡献者数据已更新: ${contributorsPath}`);
		} else {
			console.log("贡献者数据未变化");
		}

		if (releasesChanged) {
			writeFileSync(
				releasesPath,
				`${JSON.stringify(newReleasesData, null, "\t")}\n`,
				"utf8",
			);
			console.log(`发布信息数据已更新: ${releasesPath}`);
		} else {
			console.log("发布信息数据未变化");
		}

		console.log("\n数据获取完成:");
		console.log(`- 贡献者数量: ${contributors.length}`);
		console.log(`- Kazumi 最新版本: ${kazumiRelease.tag}`);
		console.log(`- OHOS 最新版本: ${ohosRelease.tag}`);
		console.log(`- 贡献者数据${contributorsChanged ? "已" : "未"}更新`);
		console.log(`- 发布信息数据${releasesChanged ? "已" : "未"}更新`);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error("脚本执行失败:", message);
		process.exit(1);
	}
}

main();
