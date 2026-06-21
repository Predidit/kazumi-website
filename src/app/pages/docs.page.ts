import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { map } from "rxjs/operators";
import { DOC_SECTIONS } from "../features/docs/docs-nav";
import { DocsStateService } from "../features/docs/docs-state.service";
import { TocComponent } from "../features/docs/toc";

@Component({
	selector: "app-docs",
	standalone: true,
	imports: [
		RouterOutlet,
		MatSidenavModule,
		MatButtonModule,
		MatIconModule,
		RouterLink,
		RouterLinkActive,
		TocComponent,
	],
	template: `
    <mat-sidenav-container class="docs-container">
      <mat-sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile() || docsNavOpen()"
        (openedChange)="syncNavState($event)"
        class="docs-sidebar"
      >
        @if (isMobile()) {
          <div class="sidebar-header">
            <span class="sidebar-heading">文档目录</span>
            <button
              mat-icon-button
              type="button"
              class="sidebar-close"
              aria-label="关闭文档目录"
              (click)="docsNavOpen.set(false)"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>
        }

        <nav class="sidebar-nav">
          @for (section of sections; track section.title) {
            <div class="sidebar-section">
              <h4 class="section-title">{{ section.title }}</h4>
              @for (page of section.pages; track page.route) {
                <a
                  class="sidebar-link"
                  [routerLink]="page.route"
                  routerLinkActive="active-link"
                  (click)="closeMobileNav()"
                >
                  <mat-icon>{{ page.icon }}</mat-icon>
                  <span>{{ page.title }}</span>
                </a>
              }
            </div>
          }
        </nav>
      </mat-sidenav>

      <mat-sidenav-content class="docs-content">
        <button
          mat-stroked-button
          type="button"
          class="docs-nav-toggle"
          (click)="docsNavOpen.set(true)"
        >
          <mat-icon>menu_book</mat-icon>
          文档目录
        </button>

        <div class="content-layout">
          <div class="content-main">
            <router-outlet />
          </div>
          <aside class="content-toc">
            <app-toc [items]="docsState.toc()" />
          </aside>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
	styles: [
		`
    .docs-container {
      height: calc(100vh - 64px);
    }

    .docs-sidebar {
      width: 260px;
      background: var(--mat-sys-surface-container-low);
      border-right: none;
      border-radius: 0;
      padding: 16px 12px;
      overflow-y: auto;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 4px 12px 16px;
      margin-bottom: 4px;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .sidebar-heading {
      color: var(--mat-sys-on-surface);
      font-size: 1rem;
      font-weight: 600;
    }

    .sidebar-close {
      color: var(--mat-sys-on-surface-variant);
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .sidebar-section {
      margin-bottom: 8px;
    }

    .section-title {
      padding: 12px 16px 6px;
      margin: 0;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
      height: 40px;
      border-radius: 20px;
      text-decoration: none;
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem;
      font-weight: 500;
      transition: background-color 0.15s ease;
    }

    .sidebar-link:hover {
      background-color: color-mix(in srgb, var(--mat-sys-on-surface) 4%, transparent);
    }

    .sidebar-link mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--mat-sys-on-surface-variant);
    }

    .sidebar-link.active-link {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      font-weight: 600;
    }

    .sidebar-link.active-link mat-icon {
      color: var(--mat-sys-on-primary-container);
    }

    .docs-content {
      padding: 0 24px;
      background: var(--mat-sys-surface);
      overflow-y: auto;
    }

    .docs-nav-toggle {
      display: none;
      margin: 16px 0 0;
      border-radius: 20px;
    }

    .docs-nav-toggle mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .content-layout {
      display: flex;
      gap: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .content-main {
      flex: 1;
      min-width: 0;
    }

    .content-toc {
      width: 220px;
      flex-shrink: 0;
    }

    @media (max-width: 1100px) {
      .content-toc {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .docs-sidebar {
        width: min(320px, 86vw);
        padding: 16px 12px;
      }

      .docs-content {
        padding: 0 16px;
      }

      .docs-nav-toggle {
        display: inline-flex;
      }

      .content-layout {
        display: block;
        max-width: none;
        width: 100%;
      }

      .content-main {
        width: 100%;
      }
    }

    :host {
      display: block;
    }
  `,
	],
})
export default class DocsComponent {
	readonly sections = DOC_SECTIONS;
	readonly docsNavOpen = signal(false);
	private readonly breakpointObserver = inject(BreakpointObserver);
	readonly isMobile = toSignal(
		this.breakpointObserver
			.observe("(max-width: 768px)")
			.pipe(map((state) => state.matches)),
		{ initialValue: false },
	);

	constructor(readonly docsState: DocsStateService) {}

	closeMobileNav() {
		if (this.isMobile()) {
			this.docsNavOpen.set(false);
		}
	}

	syncNavState(opened: boolean) {
		if (this.isMobile()) {
			this.docsNavOpen.set(opened);
		}
	}
}
