export type PlatformLink =
	| { kind: "asset"; label: string; url: string; primary?: boolean }
	| { kind: "external"; label: string; url: string }
	| { kind: "guide"; label: string; url: string; fragment?: string };

export interface Platform {
	id: string;
	name: string;
	description: string;
	icon: string;
	installNote: string;
	releaseSource: "kazumi" | "ohos";
	links: readonly PlatformLink[];
}

export const PLATFORMS: readonly Platform[] = [
	{
		id: "android",
		icon: "android",
		installNote:
			"下载 APK 后在设备上打开，按系统提示允许安装。也可以通过 F-Droid 获取应用。",
		releaseSource: "kazumi",
		name: "Android",
		description: "适用于 Android 10 及以上",
		links: [
			{
				kind: "asset",
				label: "APK",
				url: "Kazumi_android_{tag}.apk",
				primary: true,
			},
			{
				kind: "external",
				label: "F-Droid",
				url: "https://f-droid.org/packages/com.predidit.kazumi",
			},
		],
	},
	{
		id: "ios",
		icon: "phone_iphone",
		installNote: "IPA 为未签名安装包，需要自签或侧载。建议先阅读安装指南。",
		releaseSource: "kazumi",
		name: "iOS",
		description: "适用于 iOS/iPadOS 13 及以上",
		links: [
			{
				kind: "asset",
				label: "IPA",
				url: "Kazumi_ios_{tag}_no_sign.ipa",
				primary: true,
			},
			{
				kind: "guide",
				label: "安装文档",
				url: "/docs/misc/how-to-install-in-ios",
			},
		],
	},
	{
		id: "windows",
		icon: "desktop_windows",
		installNote:
			"选择 MSIX 安装，或下载便携版解压使用。遇到安装问题时可查阅使用指南。",
		releaseSource: "kazumi",
		name: "Windows",
		description: "适用于 Windows 10 及以上",
		links: [
			{
				kind: "asset",
				label: "MSIX",
				url: "Kazumi_windows_{tag}.msix",
				primary: true,
			},
			{ kind: "asset", label: "便携版", url: "Kazumi_windows_{tag}.zip" },
		],
	},
	{
		id: "mac",
		icon: "laptop_mac",
		installNote: "下载 DMG 后打开，将 Kazumi 拖入「应用程序」文件夹。",
		releaseSource: "kazumi",
		name: "macOS",
		description: "适用于 MacOS 10.15 及以上",
		links: [
			{
				kind: "asset",
				label: "DMG",
				url: "Kazumi_macos_{tag}.dmg",
				primary: true,
			},
		],
	},
	{
		id: "linux",
		icon: "computer",
		installNote:
			"提供 amd64 安装包与便携版，也可以通过 Flathub 安装。Linux 目前为实验性支持。",
		releaseSource: "kazumi",
		name: "Linux",
		description: "实验性支持",
		links: [
			{
				kind: "asset",
				label: "DEB",
				url: "Kazumi_linux_{tag}_amd64.deb",
				primary: true,
			},
			{
				kind: "asset",
				label: "便携版",
				url: "Kazumi_linux_{tag}_amd64.tar.gz",
			},
			{
				kind: "external",
				label: "Flathub",
				url: "https://flathub.org/en/apps/io.github.Predidit.Kazumi",
			},
		],
	},
	{
		id: "ohos",
		icon: "phone_android",
		installNote:
			"鸿蒙版由社区独立维护。HAP 为未签名安装包，使用前请先阅读侧载指南。",
		releaseSource: "ohos",
		name: "HarmonyOS",
		description: "适用于 HarmonyOS NEXT",
		links: [
			{
				kind: "asset",
				label: "HAP",
				url: "Kazumi_ohos_{tag}_unsigned.hap",
				primary: true,
			},
			{
				kind: "guide",
				label: "安装文档",
				url: "/docs/misc/how-to-install-in-ohos",
			},
		],
	},
	{
		id: "arch",
		icon: "terminal",
		installNote:
			"Arch Linux 为实验性支持。请按下载文档中的包管理器说明进行安装。",
		releaseSource: "kazumi",
		name: "Arch Linux",
		description: "实验性支持",
		links: [
			{
				kind: "guide",
				label: "下载文档",
				url: "/docs/intro/how-to-download",
				fragment: "arch-linux",
			},
		],
	},
];

export function detectPlatform(agent: string, maxTouchPoints = 0): string {
	if (/HarmonyOS|OpenHarmony/i.test(agent)) return "ohos";
	if (/android/i.test(agent)) return "android";
	if (
		/iPad|iPhone|iPod/i.test(agent) ||
		(/Macintosh/i.test(agent) && maxTouchPoints > 1)
	)
		return "ios";
	if (/win/i.test(agent)) return "windows";
	if (/mac/i.test(agent)) return "mac";
	if (/linux/i.test(agent)) return "linux";
	return "";
}

export function getReleaseUrl(platform: Platform): string {
	const repo =
		platform.releaseSource === "ohos" ? "ErBWs/Kazumi" : "Predidit/Kazumi";
	return `https://github.com/${repo}/releases`;
}

export function getDownloadUrl(
	platform: Platform,
	link: PlatformLink,
	tag: string,
	useMirror: boolean,
): string {
	if (link.kind !== "asset") return link.url;
	const releases = getReleaseUrl(platform);
	if (!tag) return `${releases}/latest`;
	const encodedTag = encodeURIComponent(tag);
	const url = `${releases}/download/${encodedTag}/${link.url.replace("{tag}", encodedTag)}`;
	return useMirror && platform.releaseSource !== "ohos"
		? `https://cdn.gh-proxy.org/${url}`
		: url;
}
