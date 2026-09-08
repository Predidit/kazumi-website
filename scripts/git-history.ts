import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const PROJECT_ROOT = resolve(import.meta.dirname, "..");

export function getLastModified(paths: string[], root = PROJECT_ROOT): string {
	if (!paths.length) return "";
	try {
		const date = execFileSync(
			"git",
			["--literal-pathspecs", "log", "-1", "--format=%cI", "--", ...paths],
			{ cwd: root, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] },
		).trim();
		return date && Number.isFinite(Date.parse(date)) ? date : "";
	} catch {
		return "";
	}
}
