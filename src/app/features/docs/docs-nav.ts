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
		title: "\u7b80\u4ecb",
		pages: [
			{
				route: "/docs/intro/what-is-kazumi",
				title: "Kazumi \u662f\u4ec0\u4e48\uff1f",
				icon: "info",
			},
			{
				route: "/docs/intro/how-to-download",
				title: "\u5982\u4f55\u4e0b\u8f7d",
				icon: "download",
			},
			{
				route: "/docs/intro/screenshots",
				title: "\u8f6f\u4ef6\u754c\u9762",
				icon: "photo_library",
			},
			{
				route: "/docs/intro/module-details",
				title: "\u529f\u80fd\u6a21\u5757",
				icon: "widgets",
			},
		],
	},
	{
		title: "\u89c4\u5219\u6307\u5357",
		pages: [
			{
				route: "/docs/rules/introduce-rules",
				title: "\u89c4\u5219\u4ecb\u7ecd",
				icon: "description",
			},
			{
				route: "/docs/rules/develop-rules",
				title: "\u89c4\u5219\u5f00\u53d1",
				icon: "code",
			},
			{
				route: "/docs/rules/develop-rules-example",
				title: "\u89c4\u5219\u793a\u4f8b",
				icon: "snippet_folder",
			},
		],
	},
	{
		title: "\u67b6\u6784",
		pages: [
			{
				route: "/docs/architecture/video-parser",
				title: "\u89c6\u9891\u55c5\u63a2",
				icon: "video_library",
			},
			{
				route: "/docs/architecture/bbcode",
				title: "BBCode \u89e3\u6790",
				icon: "text_fields",
			},
		],
	},
	{
		title: "\u5176\u4ed6",
		pages: [
			{
				route: "/docs/misc/qa",
				title: "\u5e38\u89c1\u95ee\u9898",
				icon: "help",
			},
			{
				route: "/docs/misc/how-to-install-in-ios",
				title: "iOS \u81ea\u7b7e",
				icon: "phone_iphone",
			},
			{
				route: "/docs/misc/how-to-install-in-ohos",
				title: "OHOS \u4fa7\u8f7d",
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
