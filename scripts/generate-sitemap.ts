import { writeFileSync } from "node:fs";
import { DOC_PAGES } from "../src/app/features/docs/docs-nav";
import { SEO_CONFIG } from "../src/app/features/seo/seo.config";

const routes = [
	"/",
	"/download",
	"/about/icon",
	...DOC_PAGES.map((page) => page.route),
];

function toUrl(route: string) {
	return route === "/"
		? `${SEO_CONFIG.siteUrl}/`
		: `${SEO_CONFIG.siteUrl}${route}`;
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
	.map(
		(route) => `  <url>
    <loc>${toUrl(route)}</loc>
  </url>`,
	)
	.join("\n")}
</urlset>
`;

writeFileSync("public/sitemap.xml", sitemap);
console.log("sitemap.xml:", routes.length, "urls");
