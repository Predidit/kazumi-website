import {
	afterRenderEffect,
	Component,
	computed,
	effect,
	inject,
	OnDestroy,
	resource,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { DomSanitizer } from "@angular/platform-browser";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { filter, map } from "rxjs/operators";
import { DocFooterComponent } from "../../features/docs/doc-footer";
import { renderDoc } from "../../features/docs/doc-renderer";
import { routeToContentPath } from "../../features/docs/docs-nav";
import { DocsStateService } from "../../features/docs/docs-state.service";
import { SeoService } from "../../features/seo/seo.service";

const DOC_CONTENT_FILES = import.meta.glob<string>(
	"/src/content/docs/**/*.md",
	{ query: "?raw", import: "default" },
);

@Component({
	selector: "app-doc-content",
	host: { "(click)": "copyCode($event)" },
	imports: [
		DocFooterComponent,
		MatProgressBarModule,
		MatIconModule,
		RouterLink,
	],
	template: `
    @if (isLoading()) {
      <div class="doc-loading" aria-live="polite">
        <mat-progress-bar mode="indeterminate" />
        <span>正在加载文档...</span>
      </div>
    } @else if (html()) {
      <nav class="doc-breadcrumb" aria-label="阅读位置"><a routerLink="/docs">指南</a><mat-icon>chevron_right</mat-icon><span>{{ metadata()?.section }}</span></nav>
      <article class="markdown-body" [innerHTML]="html()"></article>
      <app-doc-footer />
    } @else {
      <section class="doc-empty"><mat-icon>auto_stories</mat-icon><h1>{{ loadError() ? '这篇指南暂时没有加载成功' : '这篇指南还没有找到' }}</h1><p>可以回到指南首页，换一个主题继续探索。</p><a routerLink="/docs" class="text-action">回到指南首页 <mat-icon>arrow_forward</mat-icon></a></section>
    }
  `,
	styles: `
    .doc-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; color: var(--mat-sys-on-surface-variant); font-size: 11px; }
    .doc-breadcrumb mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .doc-empty { padding: 56px 24px; border-radius: 28px; background: var(--mat-sys-surface-container); }
    .doc-empty > mat-icon { font-size: 48px; width: 48px; height: 48px; color: var(--mat-sys-primary); }
    .doc-empty h1 { font-size: 28px; margin: 24px 0 16px; }
    .doc-empty p { font-size: 14px; color: var(--mat-sys-on-surface-variant); }
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
	private readonly copyTimers = new Map<
		HTMLButtonElement,
		ReturnType<typeof setTimeout>
	>();
	private readonly currentPath = toSignal(
		this.router.events.pipe(
			filter((event) => event instanceof NavigationEnd),
			map(() => routeToContentPath(this.router.url)),
		),
		{ initialValue: routeToContentPath(this.router.url) },
	);
	private readonly docResource = resource({
		params: () => this.currentPath(),
		loader: async ({ params }) => {
			const load = DOC_CONTENT_FILES[`/src/content/docs/${params}.md`];
			return load ? renderDoc(await load()) : null;
		},
	});
	private readonly doc = computed(() =>
		this.docResource.hasValue() ? this.docResource.value() : null,
	);
	readonly metadata = computed(() => this.doc()?.attributes);
	readonly loadError = this.docResource.error;
	readonly isLoading = this.docResource.isLoading;
	readonly html = computed(() => {
		const doc = this.doc();
		// HTML comes only from repository Markdown and the local renderer.
		return doc ? this.sanitizer.bypassSecurityTrustHtml(doc.html) : null;
	});

	constructor() {
		effect(() => {
			const doc = this.doc();
			this.docsState.setToc(doc?.toc ?? []);
			if (this.isLoading()) return;
			if (this.loadError()) this.seo.setUnavailable();
			else if (doc)
				this.seo.setDoc(`/docs/${this.currentPath()}`, doc.attributes);
			else this.seo.setNotFound();
		});
		afterRenderEffect(() => {
			if (this.isLoading()) return;
			const fragment = this.router.parseUrl(this.router.url).fragment;
			if (!fragment) return;
			document.getElementById(fragment)?.scrollIntoView({
				behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
					? "instant"
					: "smooth",
			});
		});
	}

	async copyCode(event: Event): Promise<void> {
		const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
			".copy-btn",
		);
		if (!button) return;
		const code = button.parentElement?.querySelector("code")?.textContent ?? "";
		try {
			await navigator.clipboard.writeText(code);
			if (!button.isConnected) return;
			clearTimeout(this.copyTimers.get(button));
			button.classList.add("copied");
			const icon = button.querySelector(".mdi");
			icon?.classList.replace("mdi-content-copy", "mdi-check");
			this.copyTimers.set(
				button,
				setTimeout(() => {
					icon?.classList.replace("mdi-check", "mdi-content-copy");
					button.classList.remove("copied");
					this.copyTimers.delete(button);
				}, 2000),
			);
		} catch {}
	}

	ngOnDestroy() {
		this.docsState.clearToc();
		for (const timer of this.copyTimers.values()) clearTimeout(timer);
	}
}
