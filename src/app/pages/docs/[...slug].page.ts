import { type ContentFile, parseRawContentFile } from "@analogjs/content";
import {
	afterNextRender,
	Component,
	computed,
	effect,
	inject,
	OnDestroy,
	resource,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { DomSanitizer, type SafeHtml } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { Marked, type Token } from "marked";
import { gfmAlert } from "marked-gfm-alert";
import {
	getHeadingList,
	gfmHeadingId,
	resetHeadings,
} from "marked-gfm-heading-id";
import { filter, map, startWith } from "rxjs/operators";
import { CodeBlockComponent } from "../../features/docs/code-block";
import { DocFooterComponent } from "../../features/docs/doc-footer";
import { routeToContentPath } from "../../features/docs/docs-nav";
import {
	DocsStateService,
	type TocItem,
} from "../../features/docs/docs-state.service";
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

type DocAttributes = {
	title?: string;
	description?: string;
	section?: string;
	icon?: string;
	order?: number;
	slug?: string;
};

type DocContentFile = ContentFile<DocAttributes>;

type RenderSegment =
	| {
			type: "html";
			html: SafeHtml;
	  }
	| {
			type: "code";
			code: string;
			language: string;
	  };

interface RenderedDoc {
	segments: RenderSegment[];
	toc: TocItem[];
}

@Component({
	selector: "app-doc-content",
	imports: [CodeBlockComponent, DocFooterComponent, MatProgressBarModule],
	template: `
    @if (isLoading()) {
      <div class="doc-loading" aria-live="polite">
        <mat-progress-bar mode="indeterminate" />
        <span>正在加载文档...</span>
      </div>
    } @else if (segments().length > 0) {
      <article class="markdown-body">
        @for (segment of segments(); track $index) {
          @if (segment.type === "code") {
            <app-code-block [code]="segment.code" [language]="segment.language" />
          } @else {
            <div [innerHTML]="segment.html"></div>
          }
        }
      </article>
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
	private readonly docsState = inject(DocsStateService);
	private readonly router = inject(Router);
	private readonly seo = inject(SeoService);
	private readonly sanitizer = inject(DomSanitizer);
	private readonly markdown = new Marked(
		gfmHeadingId(HEADING_ID_OPTIONS),
		gfmAlert({ inlineStyles: true }),
	);
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
		loader: ({ params }) => this.loadDoc(params),
	});

	private readonly doc = computed(() => this.docResource.value());
	readonly isLoading = this.docResource.isLoading;

	private readonly renderedDoc = computed<RenderedDoc>(() => {
		if (this.isLoading()) return { segments: [], toc: [] };
		const content = this.doc()?.content;
		return typeof content === "string"
			? this.render(content)
			: { segments: [], toc: [] };
	});

	readonly segments = computed(() => this.renderedDoc().segments);

	constructor() {
		effect(() => {
			const route = `/docs/${this.currentPath()}`;
			const title = this.doc()?.attributes?.title;
			this.seo.setDoc(route, title ?? "Kazumi 文档");
		});

		effect(() => {
			this.docsState.setToc(this.renderedDoc().toc);
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

	private render(content: string): RenderedDoc {
		resetHeadings();

		const tokens = this.markdown.lexer(content);
		const segments: RenderSegment[] = [];
		let htmlTokens: Token[] = [];

		const flushHtml = () => {
			if (htmlTokens.length === 0) return;
			const html = this.markdown.parse(
				htmlTokens.map((token) => token.raw).join(""),
			) as string;
			segments.push({
				type: "html",
				html: this.sanitizer.bypassSecurityTrustHtml(html),
			});
			htmlTokens = [];
		};

		for (const token of tokens) {
			if (token.type === "code") {
				flushHtml();
				segments.push({
					type: "code",
					code: token.text,
					language: token.lang ?? "",
				});
			} else {
				htmlTokens.push(token);
			}
		}

		flushHtml();
		return {
			segments,
			toc: getHeadingList().map(({ id, level, raw }) => ({
				id,
				level,
				text: raw,
			})),
		};
	}
}
