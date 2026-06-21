export interface DocPage {
	route: string;
	title: string;
	icon: string;
}

export interface DocSection {
	title: string;
	pages: DocPage[];
}

export const DOC_SECTIONS: DocSection[] = [
	{
		title: "简介",
		pages: [
			{
				route: "/docs/intro/what-is-kazumi",
				title: "Kazumi 是什么？",
				icon: "info",
			},
			{
				route: "/docs/intro/how-to-download",
				title: "如何下载",
				icon: "download",
			},
			{
				route: "/docs/intro/screenshots",
				title: "软件界面",
				icon: "photo_library",
			},
			{
				route: "/docs/intro/module-details",
				title: "功能模块",
				icon: "widgets",
			},
		],
	},
	{
		title: "规则指南",
		pages: [
			{
				route: "/docs/rules/introduce-rules",
				title: "规则介绍",
				icon: "description",
			},
			{
				route: "/docs/rules/develop-rules",
				title: "规则开发",
				icon: "code",
			},
			{
				route: "/docs/rules/develop-rules-example",
				title: "规则示例",
				icon: "snippet_folder",
			},
		],
	},
	{
		title: "架构",
		pages: [
			{
				route: "/docs/architecture/video-parser",
				title: "视频嗅探",
				icon: "video_library",
			},
			{
				route: "/docs/architecture/bbcode",
				title: "BBCode 解析",
				icon: "text_fields",
			},
		],
	},
	{
		title: "其他",
		pages: [
			{
				route: "/docs/misc/qa",
				title: "常见问题",
				icon: "help",
			},
			{
				route: "/docs/misc/how-to-install-in-ios",
				title: "iOS 自签",
				icon: "phone_iphone",
			},
			{
				route: "/docs/misc/how-to-install-in-ohos",
				title: "OHOS 侧载",
				icon: "phone_android",
			},
		],
	},
];

export const DOC_PAGES = DOC_SECTIONS.flatMap((section) => section.pages);

export function normalizeDocRoute(url: string): string {
	return url.split(/[?#]/, 1)[0].replace(/\/$/, "");
}

export function routeToContentPath(route: string): string {
	return normalizeDocRoute(route).replace(/^\/docs\//, "");
}
