export interface DocPage {
	route: string;
	title: string;
	icon: string;
}

export interface DocSection {
	title: string;
	pages: DocPage[];
}

export function normalizeDocRoute(url: string): string {
	return url.split(/[?#]/, 1)[0].replace(/\/$/, "");
}

export function routeToContentPath(route: string): string {
	return normalizeDocRoute(route).replace(/^\/docs\//, "");
}
