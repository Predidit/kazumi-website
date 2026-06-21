import { isPlatformBrowser } from "@angular/common";
import {
	Component,
	computed,
	inject,
	PLATFORM_ID,
	signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatIconModule } from "@angular/material/icon";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { filter } from "rxjs/operators";
import { DOC_PAGES, normalizeDocRoute, routeToContentPath } from "./docs-nav";

const FOOTER_LABELS = {
	edit: "帮助我们改进本页面内容",
	lastUpdated: "上次更新",
	prev: "上一页",
	next: "下一页",
};

@Component({
	selector: "app-doc-footer",
	imports: [RouterLink, MatIconModule],
	template: `
    <div class="doc-footer">
      <div class="edit-bar">
        <a [href]="editUrl()" target="_blank" rel="noopener noreferrer" class="edit-link">
          <mat-icon>edit</mat-icon>
          {{ labels.edit }}
        </a>
        @if (lastUpdated()) {
          <span class="last-updated">{{ labels.lastUpdated }}: {{ lastUpdated() }}</span>
        }
      </div>

      <hr class="divider" />

      <div class="nav-links">
        @if (prev()) {
          <a [routerLink]="prev()!.route" class="nav-link prev">
            <span class="nav-label">{{ labels.prev }}</span>
            <span class="nav-title">{{ prev()!.title }}</span>
          </a>
        } @else {
          <div></div>
        }
        @if (next()) {
          <a [routerLink]="next()!.route" class="nav-link next">
            <span class="nav-label">{{ labels.next }}</span>
            <span class="nav-title">{{ next()!.title }}</span>
          </a>
        } @else {
          <div></div>
        }
      </div>
    </div>
  `,
	styles: `
    .doc-footer {
      margin-top: 48px;
      padding-bottom: 32px;
    }

    .edit-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .edit-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--mat-sys-primary);
      text-decoration: none;
      font-size: 0.8125rem;
      font-weight: 500;
      transition: opacity 0.2s;
    }

    .edit-link:hover {
      opacity: 0.8;
    }

    .edit-link mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .last-updated {
      font-size: 0.8125rem;
      color: var(--mat-sys-outline);
    }

    .divider {
      border: none;
      border-top: 1px solid var(--mat-sys-outline-variant);
      margin: 24px 0;
    }

    .nav-links {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .nav-link {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 16px 20px;
      border-radius: 12px;
      text-decoration: none;
      border: 1px solid var(--mat-sys-outline-variant);
      transition: border-color 0.2s, background-color 0.2s;
      min-width: 0;
    }

    .nav-link:hover {
      border-color: var(--mat-sys-primary);
      background-color: color-mix(in srgb, var(--mat-sys-primary) 4%, transparent);
    }

    .nav-label {
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
      font-weight: 500;
    }

    .nav-title {
      font-size: 0.875rem;
      color: var(--mat-sys-primary);
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .next {
      text-align: right;
    }

    @media (max-width: 768px) {
      .nav-links {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class DocFooterComponent {
	private readonly router = inject(Router);
	private readonly platformId = inject(PLATFORM_ID);
	private readonly updatesCache = signal<Record<string, string>>({});
	private readonly currentRoute = signal(normalizeDocRoute(this.router.url));
	readonly labels = FOOTER_LABELS;

	private readonly pageIndex = computed(() =>
		DOC_PAGES.findIndex((page) => page.route === this.currentRoute()),
	);

	readonly prev = computed(() => {
		const index = this.pageIndex();
		return index > 0 ? DOC_PAGES[index - 1] : null;
	});

	readonly next = computed(() => {
		const index = this.pageIndex();
		return index >= 0 && index < DOC_PAGES.length - 1
			? DOC_PAGES[index + 1]
			: null;
	});

	readonly editUrl = computed(() => {
		const contentPath = routeToContentPath(this.currentRoute());
		return `https://github.com/Predidit/kazumi-website/edit/main/src/content/docs/${contentPath}.md`;
	});

	readonly lastUpdated = computed(
		() => this.updatesCache()[this.currentRoute()] ?? "",
	);

	constructor() {
		this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.pipe(takeUntilDestroyed())
			.subscribe(() =>
				this.currentRoute.set(normalizeDocRoute(this.router.url)),
			);

		if (isPlatformBrowser(this.platformId)) {
			fetch("/doc-updates.json")
				.then((response) => response.json())
				.then((data: Record<string, string>) => this.updatesCache.set(data))
				.catch(() => {});
		}
	}
}
