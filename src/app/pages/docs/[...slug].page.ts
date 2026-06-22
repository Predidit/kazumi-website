import { type ContentFile, parseRawContentFile } from "@analogjs/content";
import {
	afterNextRender,
	Component,
	computed,
	ElementRef,
	effect,
	inject,
	OnDestroy,
	resource,
	ViewChild,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { DomSanitizer, type SafeHtml } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { Marked } from "marked";
import { gfmAlert } from "marked-gfm-alert";
import {
	getHeadingList,
	gfmHeadingId,
	resetHeadings,
} from "marked-gfm-heading-id";
import markedShiki from "marked-shiki";
import { filter, map, startWith } from "rxjs/operators";
import { createHighlighter } from "shiki";
import { DocFooterComponent } from "../../features/docs/doc-footer";
import { routeToContentPath } from "../../features/docs/docs-nav";
import { DocsStateService } from "../../features/docs/docs-state.service";
import { SeoService } from "../../features/seo/seo.service";

const DOC_CONTENT_FILES = import.meta.glob<string>(
	"/src/content/docs/**/*.md",
	{
		query: "?raw",
		import: "default",
	},
);
const HEADING_ID_OPTIONS = { globalSlugs: true } as { prefix?: string } & {
	globalSlugs: boolean;
};

const SHIKI_LANGS = [
	"bash",
	"shell",
	"javascript",
	"typescript",
	"json",
	"html",
	"css",
	"yaml",
	"markdown",
	"dart",
	"python",
	"java",
	"go",
	"rust",
	"ruby",
	"php",
	"sql",
	"c",
	"cpp",
	"swift",
	"kotlin",
	"scala",
	"powershell",
	"xml",
	"xsl",
	"graphql",
	"toml",
	"ini",
	"dockerfile",
	"diff",
	"latex",
	"text",
	"protobuf",
] as const;

const highlighterReady = createHighlighter({
	themes: ["github-light", "github-dark"],
	langs: [...SHIKI_LANGS],
});

type DocAttributes = {
	title?: string;
	description?: string;
	section?: string;
	icon?: string;
	order?: number;
	slug?: string;
};

type DocContentFile = ContentFile<DocAttributes>;

interface RenderedDoc {
	html: SafeHtml;
}

@Component({
	selector: "app-doc-content",
	imports: [DocFooterComponent, MatProgressBarModule],
	template: `
    @if (isLoading()) {
      <div class="doc-loading" aria-live="polite">
        <mat-progress-bar mode="indeterminate" />
        <span>正在加载文档...</span>
      </div>
    } @else if (renderedDoc()) {
      <article class="markdown-body" #article [innerHTML]="renderedDoc()!.html"></article>
      <app-doc-footer />
    }
  `,
	styles: `
    .doc-loading {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 48px 0;
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem;
    }
  `,
})
export default class DocContentComponent implements OnDestroy {
	@ViewChild("article") private articleRef?: ElementRef<HTMLElement>;
	private readonly docsState = inject(DocsStateService);
	private readonly router = inject(Router);
	private readonly seo = inject(SeoService);
	private readonly sanitizer = inject(DomSanitizer);
	private markdown?: Marked;
	private readonly currentPath = toSignal(
		this.router.events.pipe(
			filter((event) => event instanceof NavigationEnd),
			startWith(null),
			map(() => routeToContentPath(this.router.url)),
		),
		{ initialValue: routeToContentPath(this.router.url) },
	);
	private readonly docResource = resource<DocContentFile | null, string>({
		params: () => this.currentPath(),
		loader: async ({ params }) => {
			const doc = await this.loadDoc(params);
			if (doc && typeof doc.content === "string") {
				await this.ensureMarked();
				doc.content = await this.render(doc.content);
			}
			return doc;
		},
	});

	private readonly doc = computed(() => this.docResource.value());
	readonly isLoading = this.docResource.isLoading;

	readonly renderedDoc = computed<RenderedDoc | null>(() => {
		if (this.isLoading()) return null;
		const d = this.doc();
		if (!d || typeof d.content !== "string") return null;
		return {
			html: this.sanitizer.bypassSecurityTrustHtml(d.content),
		};
	});

	constructor() {
		const host = inject(ElementRef).nativeElement as HTMLElement;

		host.addEventListener("click", (e) => {
			const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
				".copy-btn",
			);
			if (!btn) return;
			const code = btn.parentElement?.querySelector("code")?.textContent ?? "";
			navigator.clipboard.writeText(code);
			btn.classList.add("copied");
			btn.textContent = "已复制";
			setTimeout(() => {
				btn.classList.remove("copied");
				btn.textContent = "复制";
			}, 2000);
		});

		afterNextRender(() => {
			const article = this.articleRef?.nativeElement;
			if (!article) return;

			effect(() => {
				this.renderedDoc();
				queueMicrotask(() => {
					for (const pre of article.querySelectorAll<HTMLPreElement>(
						"pre.shiki:not(:has(.copy-btn))",
					)) {
						const btn = document.createElement("button");
						btn.className = "copy-btn";
						btn.setAttribute("aria-label", "复制代码");
						btn.textContent = "复制";
						pre.style.position = "relative";
						pre.prepend(btn);
					}
				});
			});
		});

		effect(() => {
			const route = `/docs/${this.currentPath()}`;
			const title = this.doc()?.attributes?.title;
			this.seo.setDoc(route, title ?? "Kazumi 文档");
		});

		effect(() => {
			if (this.isLoading()) return;
			const fragment = this.router.parseUrl(this.router.url).fragment;
			if (!fragment) return;
			afterNextRender(() => {
				document
					.getElementById(fragment)
					?.scrollIntoView({ behavior: "smooth" });
			});
		});
	}

	ngOnDestroy() {
		this.docsState.clearToc();
	}

	private async ensureMarked() {
		if (this.markdown) return;
		const highlighter = await highlighterReady;
		this.markdown = new Marked(
			gfmHeadingId(HEADING_ID_OPTIONS),
			gfmAlert({ inlineStyles: true }),
			markedShiki({
				highlight(code, lang) {
					if (highlighter.getLoadedLanguages().includes(lang)) {
						return highlighter.codeToHtml(code, {
							lang,
							themes: {
								light: "github-light",
								dark: "github-dark",
							},
						});
					}
					return `<pre class="shiki"><code>${code
						.replace(/&/g, "&amp;")
						.replace(/</g, "&lt;")
						.replace(/>/g, "&gt;")}</code></pre>`;
				},
			}),
		);
	}

	private async loadDoc(path: string): Promise<DocContentFile | null> {
		const filename = `/src/content/docs/${path}.md`;
		const loadContent = DOC_CONTENT_FILES[filename];

		if (!loadContent) {
			return null;
		}

		const { content, attributes } = parseRawContentFile<DocAttributes>(
			await loadContent(),
		);

		return {
			filename: filename.replace(/\.md$/, ""),
			slug: path,
			attributes,
			content,
			toc: [],
		};
	}

	private async render(content: string): Promise<string> {
		resetHeadings();
		const html = (await this.markdown?.parse(content)) as string | undefined;
		const toc = getHeadingList().map(({ id, level, raw }) => ({
			id,
			level,
			text: raw,
		}));
		this.docsState.setToc(toc);
		return html ?? "";
	}
}
