import { DOCUMENT } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { SEO_CONFIG } from "./seo.config";

interface SeoMeta {
	title: string;
	description: string;
	path: string;
	type?: "website" | "article";
	image?: string;
	keywords?: string;
	structuredData?: Record<string, unknown>;
}

@Injectable({ providedIn: "root" })
export class SeoService {
	private readonly title = inject(Title);
	private readonly meta = inject(Meta);
	private readonly document = inject(DOCUMENT);
	private canonicalLink?: HTMLLinkElement;
	private structuredDataScript?: HTMLScriptElement;

	setHome() {
		this.setMeta({
			title: SEO_CONFIG.defaultTitle,
			description: SEO_CONFIG.defaultDescription,
			path: "/",
			structuredData: {
				"@context": "https://schema.org",
				"@type": "SoftwareApplication",
				name: "Kazumi",
				url: `${SEO_CONFIG.siteUrl}/`,
				applicationCategory: "MultimediaApplication",
				operatingSystem: "Android, Windows, macOS, Linux, iOS, HarmonyOS",
				description: SEO_CONFIG.defaultDescription,
				image: this.absoluteUrl(SEO_CONFIG.defaultImage),
				author: {
					"@type": "Person",
					name: "Predidit",
					url: "https://github.com/Predidit",
				},
				downloadUrl: `${SEO_CONFIG.siteUrl}/download`,
				softwareHelp: `${SEO_CONFIG.siteUrl}/docs/intro/what-is-kazumi`,
				offers: {
					"@type": "Offer",
					price: "0",
					priceCurrency: "CNY",
				},
			},
		});
	}

	setDownload() {
		this.setMeta({
			title: "下载 Kazumi - Kazumi 官网",
			description:
				"在 Kazumi 官网下载 Kazumi，获取 Android、Windows、macOS、Linux、iOS 和 OHOS 版本安装包，并查看安装教程与最新版本信息。",
			path: "/download",
			keywords:
				"Kazumi 下载, Kazumi Android, Kazumi Windows, Kazumi macOS, Kazumi Linux, Kazumi iOS, Kazumi OHOS, Kazumi 官网",
			structuredData: {
				"@context": "https://schema.org",
				"@type": "SoftwareApplication",
				name: "Kazumi",
				url: `${SEO_CONFIG.siteUrl}/download`,
				applicationCategory: "MultimediaApplication",
				operatingSystem: "Android, Windows, macOS, Linux, iOS, HarmonyOS",
				description:
					"在 Kazumi 官网下载 Kazumi，获取 Android、Windows、macOS、Linux、iOS 和 OHOS 版本安装包，并查看安装教程与最新版本信息。",
				image: this.absoluteUrl(SEO_CONFIG.defaultImage),
				author: {
					"@type": "Person",
					name: "Predidit",
					url: "https://github.com/Predidit",
				},
				downloadUrl: `${SEO_CONFIG.siteUrl}/download`,
				offers: {
					"@type": "Offer",
					price: "0",
					priceCurrency: "CNY",
				},
			},
		});
	}

	setIcon() {
		this.setMeta({
			title: "图标来源 - Kazumi 官网",
			description:
				"了解 Kazumi 官网与 Kazumi 项目图标来源、授权说明和原作者信息。",
			path: "/about/icon",
			keywords: "Kazumi 图标, Kazumi 官网, Kazumi 授权, Kazumi 项目",
			structuredData: {
				"@context": "https://schema.org",
				"@type": "WebPage",
				name: "图标来源 - Kazumi 官网",
				url: `${SEO_CONFIG.siteUrl}/about/icon`,
				description:
					"了解 Kazumi 官网与 Kazumi 项目图标来源、授权说明和原作者信息。",
				isPartOf: {
					"@type": "WebSite",
					name: SEO_CONFIG.siteName,
					url: SEO_CONFIG.siteUrl,
				},
			},
		});
	}

	setDoc(route: string, title: string) {
		this.setMeta({
			title: `${title} - Kazumi 文档 - Kazumi 官网`,
			description: `阅读 Kazumi 官网文档：${title}。了解 Kazumi 下载、安装、规则开发、功能模块和跨平台使用方法。`,
			path: route,
			type: "article",
			keywords: `Kazumi 文档, ${title}, Kazumi 官网, Kazumi 下载, Kazumi 使用教程`,
			structuredData: {
				"@context": "https://schema.org",
				"@type": "TechArticle",
				headline: title,
				description: `阅读 Kazumi 官网文档：${title}。了解 Kazumi 下载、安装、规则开发、功能模块和跨平台使用方法。`,
				url: `${SEO_CONFIG.siteUrl}${route}`,
				author: {
					"@type": "Person",
					name: "Predidit",
					url: "https://github.com/Predidit",
				},
				publisher: {
					"@type": "Organization",
					name: SEO_CONFIG.siteName,
					url: SEO_CONFIG.siteUrl,
				},
				mainEntityOfPage: {
					"@type": "WebPage",
					"@id": `${SEO_CONFIG.siteUrl}${route}`,
				},
				isPartOf: {
					"@type": "WebSite",
					name: SEO_CONFIG.siteName,
					url: SEO_CONFIG.siteUrl,
				},
			},
		});
	}

	private setMeta({
		title,
		description,
		path,
		type = "website",
		image = SEO_CONFIG.defaultImage,
		keywords = SEO_CONFIG.keywords,
		structuredData,
	}: SeoMeta) {
		const url = this.absoluteUrl(path);
		const imageUrl = this.absoluteUrl(image);

		this.title.setTitle(title);
		this.meta.updateTag({ name: "description", content: description });
		this.meta.updateTag({ name: "keywords", content: keywords });
		this.meta.updateTag({ name: "robots", content: "index, follow" });
		this.meta.updateTag({
			name: "application-name",
			content: SEO_CONFIG.siteName,
		});
		this.meta.updateTag({ property: "og:type", content: type });
		this.meta.updateTag({ property: "og:locale", content: SEO_CONFIG.locale });
		this.meta.updateTag({
			property: "og:site_name",
			content: SEO_CONFIG.siteName,
		});
		this.meta.updateTag({ property: "og:title", content: title });
		this.meta.updateTag({ property: "og:description", content: description });
		this.meta.updateTag({ property: "og:url", content: url });
		this.meta.updateTag({ property: "og:image", content: imageUrl });
		this.meta.updateTag({ name: "twitter:card", content: "summary" });
		this.meta.updateTag({ name: "twitter:title", content: title });
		this.meta.updateTag({ name: "twitter:description", content: description });
		this.meta.updateTag({ name: "twitter:image", content: imageUrl });
		this.updateCanonical(url);
		this.updateStructuredData(structuredData);
	}

	private updateCanonical(url: string) {
		this.canonicalLink ??=
			this.document.head.querySelector<HTMLLinkElement>(
				'link[rel="canonical"]',
			) ?? this.document.createElement("link");
		this.canonicalLink.setAttribute("rel", "canonical");
		this.canonicalLink.setAttribute("href", url);
		if (!this.canonicalLink.parentNode) {
			this.document.head.appendChild(this.canonicalLink);
		}
	}

	private updateStructuredData(data?: Record<string, unknown>) {
		if (!data) {
			this.structuredDataScript?.remove();
			this.structuredDataScript = undefined;
			return;
		}

		this.structuredDataScript ??= this.document.createElement("script");
		this.structuredDataScript.type = "application/ld+json";
		this.structuredDataScript.textContent = JSON.stringify(data);
		if (!this.structuredDataScript.parentNode) {
			this.document.head.appendChild(this.structuredDataScript);
		}
	}

	private absoluteUrl(path: string) {
		if (/^https?:\/\//.test(path)) return path;
		const normalizedPath = path.startsWith("/") ? path : `/${path}`;
		return normalizedPath === "/"
			? `${SEO_CONFIG.siteUrl}/`
			: `${SEO_CONFIG.siteUrl}${normalizedPath}`;
	}
}
