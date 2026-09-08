import { NgTemplateOutlet } from "@angular/common";
import {
	Component,
	computed,
	ElementRef,
	inject,
	ViewChild,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatIconModule } from "@angular/material/icon";
import {
	NavigationEnd,
	Router,
	RouterLink,
	RouterLinkActive,
	RouterOutlet,
} from "@angular/router";
import { filter, map } from "rxjs/operators";
import { DocNavService } from "../features/docs/doc-nav.service";
import { DocSearchComponent } from "../features/docs/doc-search";
import { DocsStateService } from "../features/docs/docs-state.service";
import { TocComponent } from "../features/docs/toc";

@Component({
	selector: "app-docs",
	host: { "(document:keydown.escape)": "closePanels()" },
	imports: [
		RouterOutlet,
		RouterLink,
		RouterLinkActive,
		MatIconModule,
		TocComponent,
		NgTemplateOutlet,
		DocSearchComponent,
	],
	template: `
    <div class="docs-shell" [class.overview]="isOverview()">
      @if (!isOverview()) {
        <aside class="docs-sidebar"><a routerLink="/docs" class="guide-home"><mat-icon>arrow_back</mat-icon>指南首页</a><app-doc-search /><ng-container [ngTemplateOutlet]="navigation" /></aside>
        <div class="mobile-tools">
          <details #mobileNavigation name="guide-panels"><summary><mat-icon>menu_book</mat-icon>文档目录<mat-icon>expand_more</mat-icon></summary><div class="mobile-panel"><a routerLink="/docs" (click)="closeNavigation()" class="guide-home">返回指南首页<mat-icon>arrow_forward</mat-icon></a><ng-container [ngTemplateOutlet]="navigation" /></div></details>
          <details class="mobile-toc" name="guide-panels"><summary><mat-icon>toc</mat-icon>本页内容<mat-icon>expand_more</mat-icon></summary><div class="mobile-panel"><app-toc [items]="docsState.toc()" [embedded]="true" (linkClick)="closeToc()" /></div></details>
        </div>
      }
      <div class="docs-content"><router-outlet /></div>
      @if (!isOverview()) { <aside class="desktop-toc"><app-toc [items]="docsState.toc()" /></aside> }
    </div>
    <ng-template #navigation>
      <nav class="document-nav" aria-label="指南目录">
        @for (section of sections(); track section.title) {
          <section><h2>{{ section.title }}</h2>
            @for (page of section.pages; track page.route) {
              <a [routerLink]="page.route" routerLinkActive="selected" ariaCurrentWhenActive="page" (click)="closeNavigation()"><mat-icon>{{ page.icon }}</mat-icon><span>{{ page.title }}</span></a>
            }
          </section>
        }
      </nav>
    </ng-template>
  `,
	styles: `
    :host { display: block; }
    .docs-shell { max-width: 1440px; margin: auto; padding: 24px 32px 48px; display: grid; grid-template-columns: 240px minmax(0, 1fr) 180px; gap: 40px; align-items: start; }
    .docs-shell.overview { display: block; max-width: 1360px; padding: 24px 40px 40px; }
    .docs-sidebar { position: sticky; top: calc(var(--app-header-height) + 16px); max-height: calc(100dvh - var(--app-header-height) - 40px); overflow-y: auto; padding: 4px 8px 16px 0; scrollbar-width: thin; scrollbar-color: var(--mat-sys-outline-variant) transparent; }
    .guide-home { display: flex; align-items: center; gap: 10px; min-height: 44px; margin-bottom: 16px; font-size: 13px; font-weight: 600; }
    .guide-home mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .document-nav section { margin-top: 24px; }
    .document-nav h2 { font-size: 11px; font-weight: 650; letter-spacing: .04em; padding: 0 14px; margin-bottom: 10px; color: var(--mat-sys-on-surface-variant); }
    .document-nav a { display: flex; align-items: center; gap: 10px; padding: 12px 14px; min-height: 46px; margin-bottom: 3px; border-radius: 10px; font-size: 12px; color: var(--mat-sys-on-surface-variant); transition: border-radius var(--app-motion-spring), background var(--app-motion-fast); }
    .document-nav a mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .document-nav a:hover { background: var(--mat-sys-surface-container); }
    .document-nav a.selected { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); border-radius: 26px; font-weight: 650; }
    .docs-content { min-width: 0; padding: 12px 0; }
    .overview .docs-content { padding: 0; }
    .desktop-toc { position: sticky; top: calc(var(--app-header-height) + 40px); padding-top: 40px; }
    .mobile-tools { display: none; }
    @media (max-width: 1200px) { .docs-shell { grid-template-columns: 224px minmax(0, 1fr); gap: 28px; } .desktop-toc { display: none; } }
    @media (max-width: 850px) {
      .docs-shell { display: block; padding: 8px 24px 32px; }
      .docs-sidebar { display: none; }
      .mobile-tools { display: flex; align-items: flex-start; gap: 8px; position: sticky; top: var(--app-header-height); z-index: 20; background: var(--mat-sys-surface); padding: 8px 0; margin-bottom: 20px; }
      details { flex: 1; min-width: 0; }
      summary { list-style: none; display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 24px; background: var(--mat-sys-surface-container); color: var(--mat-sys-primary); font-size: 12px; font-weight: 600; cursor: pointer; min-height: 48px; }
      summary::-webkit-details-marker { display: none; }
      summary mat-icon { font-size: 18px; width: 18px; height: 18px; }
      summary mat-icon:last-child { margin-left: auto; }
      details[open] summary { background: var(--mat-sys-primary-container); }
      .mobile-panel { position: absolute; left: 0; right: 0; max-height: calc(100dvh - 260px); overflow-y: auto; margin-top: 8px; padding: 20px; background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); border-radius: 24px; box-shadow: var(--mat-sys-level2); }
      .document-nav section:first-child { margin-top: 0; }
      .docs-content { padding-top: 0; }
    }
    @media (max-width: 700px) { .docs-shell.overview { padding: 16px; } .docs-shell { padding: 8px 20px 32px; } }
  `,
})
export default class DocsComponent {
	readonly sections = inject(DocNavService).sections;
	readonly docsState = inject(DocsStateService);
	private readonly router = inject(Router);
	private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
	private readonly url = toSignal(
		this.router.events.pipe(
			filter((event) => event instanceof NavigationEnd),
			map(() => this.router.url),
		),
		{ initialValue: this.router.url },
	);
	readonly isOverview = computed(
		() => this.url().split(/[?#]/)[0].replace(/\/$/, "") === "/docs",
	);
	@ViewChild("mobileNavigation")
	private mobileNavigation?: ElementRef<HTMLDetailsElement>;

	closeNavigation() {
		if (this.mobileNavigation) this.mobileNavigation.nativeElement.open = false;
	}
	closePanels() {
		this.closeNavigation();
		this.closeToc();
	}
	closeToc() {
		const details =
			this.host.nativeElement.querySelector<HTMLDetailsElement>(".mobile-toc");
		if (details) details.open = false;
	}
}
