import { assert, describe, expect, it } from "vitest";
import { detectPlatform, getDownloadUrl, PLATFORMS } from "./platforms";

describe("download destinations", () => {
	it("resolves release assets, mirrors, and the independent HarmonyOS repository", () => {
		const android = PLATFORMS.find((platform) => platform.id === "android");
		const ohos = PLATFORMS.find((platform) => platform.id === "ohos");
		assert(android);
		assert(ohos);
		const asset = android.links[0];
		const url =
			"https://github.com/Predidit/Kazumi/releases/download/1.9.0/Kazumi_android_1.9.0.apk";
		expect(getDownloadUrl(android, asset, "1.9.0", false)).toBe(url);
		expect(getDownloadUrl(android, asset, "1.9.0", true)).toBe(
			`https://cdn.gh-proxy.org/${url}`,
		);
		expect(getDownloadUrl(ohos, ohos.links[0], "1.8.0", true)).toBe(
			"https://github.com/ErBWs/Kazumi/releases/download/1.8.0/Kazumi_ohos_1.8.0_unsigned.hap",
		);
	});

	it("falls back to each release page when version data is unavailable", () => {
		for (const platform of PLATFORMS) {
			for (const link of platform.links.filter(
				(link) => link.kind === "asset",
			)) {
				const repo =
					platform.id === "ohos" ? "ErBWs/Kazumi" : "Predidit/Kazumi";
				expect(getDownloadUrl(platform, link, "", true)).toBe(
					`https://github.com/${repo}/releases/latest`,
				);
			}
		}
	});

	it("keeps store links and guide fragments independent of release settings", () => {
		for (const platform of PLATFORMS) {
			for (const link of platform.links.filter(
				(link) => link.kind !== "asset",
			)) {
				expect(getDownloadUrl(platform, link, "1.9.0", true)).toBe(link.url);
			}
		}
		expect(
			PLATFORMS.find((platform) => platform.id === "arch")?.links[0],
		).toMatchObject({
			kind: "guide",
			url: "/docs/intro/how-to-download",
			fragment: "arch-linux",
		});
	});
});

describe("device detection", () => {
	it.each([
		["Mozilla/5.0 (Linux; Android 14; HarmonyOS)", 0, "ohos"],
		["Mozilla/5.0 (Linux; Android 14)", 0, "android"],
		["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)", 5, "ios"],
		["Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)", 0, "ios"],
		["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)", 0, "mac"],
		["Mozilla/5.0 (Windows NT 10.0; Win64; x64)", 0, "windows"],
		["Mozilla/5.0 (X11; Linux x86_64)", 0, "linux"],
		["Unknown device", 0, ""],
	])("detects %s with %i touch points as %s", (agent, touchPoints, expected) => {
		expect(detectPlatform(agent, touchPoints)).toBe(expected);
	});
});
