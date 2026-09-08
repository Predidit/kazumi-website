import { RESPONSE } from "@analogjs/router/tokens";
import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SeoService } from "./seo.service";

describe("SeoService", () => {
	let seo: SeoService;
	let doc: Document;
	let response: {
		headersSent: boolean;
		statusCode: number;
		setHeader: ReturnType<typeof vi.fn>;
		removeHeader: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		doc = document.implementation.createHTMLDocument();
		response = {
			headersSent: false,
			statusCode: 200,
			setHeader: vi.fn(),
			removeHeader: vi.fn(),
		};
		TestBed.configureTestingModule({
			providers: [
				SeoService,
				{ provide: DOCUMENT, useValue: doc },
				{ provide: RESPONSE, useValue: response },
			],
		});
		seo = TestBed.inject(SeoService);
	});

	const metadata = {
		title: "在 HarmonyOS 上安装",
		description: "在 HarmonyOS 设备上侧载安装 Kazumi 的详细教程。",
		authors: [" ErBWs ", "ChouChiu", "ErBWs", ""],
	};

	it("uses the document description and actual authors across search and sharing metadata", () => {
		seo.setDoc("/docs/misc/how-to-install-in-ohos", metadata);
		for (const selector of [
			'meta[name="description"]',
			'meta[property="og:description"]',
			'meta[name="twitter:description"]',
		]) {
			expect(doc.querySelector(selector)?.getAttribute("content")).toBe(
				metadata.description,
			);
		}
		const article = JSON.parse(
			doc.querySelector('script[type="application/ld+json"]')?.textContent ??
				"{}",
		);
		expect(article.description).toBe(metadata.description);
		expect(article.author).toEqual([
			{ "@type": "Person", name: "ErBWs", url: "https://github.com/ErBWs" },
			{
				"@type": "Person",
				name: "ChouChiu",
				url: "https://github.com/ChouChiu",
			},
		]);
		expect(article.url).toBe(
			"https://kazumi.app/docs/misc/how-to-install-in-ohos",
		);
	});

	it("does not invent an author when the document has none", () => {
		seo.setDoc("/docs/rules/develop-api-rules", { title: "API 规则开发" });
		const article = JSON.parse(
			doc.querySelector('script[type="application/ld+json"]')?.textContent ??
				"{}",
		);
		expect(article.author).toBeUndefined();
		expect(article.publisher.name).toBe("Kazumi 官网");
	});

	it("removes stale article data and canonical links on missing pages, and restores valid page metadata", () => {
		seo.setDoc("/docs/misc/how-to-install-in-ohos", metadata);
		seo.setNotFound();
		expect(response.statusCode).toBe(404);
		expect(response.setHeader).toHaveBeenCalledWith(
			"X-Robots-Tag",
			"noindex, follow",
		);
		expect(
			doc.querySelector('meta[name="robots"]')?.getAttribute("content"),
		).toBe("noindex, follow");
		expect(doc.querySelector('link[rel="canonical"]')).toBeNull();
		expect(doc.querySelector('meta[property="og:url"]')).toBeNull();
		expect(doc.querySelector('script[type="application/ld+json"]')).toBeNull();
		seo.setHome();
		expect(response.statusCode).toBe(200);
		expect(response.removeHeader).toHaveBeenCalledWith("X-Robots-Tag");
		expect(
			doc.querySelector('meta[name="robots"]')?.getAttribute("content"),
		).toBe("index, follow");
		expect(doc.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
		expect(
			doc.querySelector('link[rel="canonical"]')?.getAttribute("href"),
		).toBe("https://kazumi.app/");
		expect(
			doc.querySelectorAll('script[type="application/ld+json"]'),
		).toHaveLength(1);
	});

	it("reports temporary loading failures as 503 instead of 404", () => {
		seo.setUnavailable();
		expect(response.statusCode).toBe(503);
		expect(doc.title).toBe("指南暂时无法加载 - Kazumi");
		expect(
			doc.querySelector('meta[name="robots"]')?.getAttribute("content"),
		).toBe("noindex, follow");
	});

	it("removes server-rendered structured data even before the service has cached its element", () => {
		const script = doc.createElement("script");
		script.type = "application/ld+json";
		script.textContent = '{"@type":"TechArticle"}';
		doc.head.appendChild(script);
		seo.setGuide();
		expect(doc.querySelector('script[type="application/ld+json"]')).toBeNull();
	});
});
