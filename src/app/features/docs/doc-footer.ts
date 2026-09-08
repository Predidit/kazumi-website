import { DatePipe } from "@angular/common";
import {
	afterNextRender,
	Component,
	computed,
	inject,
	signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatIconModule } from "@angular/material/icon";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { filter, map } from "rxjs/operators";
import { DocNavService } from "./doc-nav.service";
import { normalizeDocRoute, routeToContentPath } from "./docs-nav";

@Component({
	selector: "app-doc-footer",
	imports: [RouterLink, MatIconModule, DatePipe],
	template: `
    <div class="doc-footer">
      <div class="edit-bar">
        <a [href]="editUrl()" target="_blank" rel="noopener noreferrer" class="edit-link">
          <mat-icon>edit</mat-icon>
          帮助我们改进本页面内容
        </a>
        @if (lastUpdated()) {
          <span class="last-updated">上次更新: {{ lastUpdated() | date: "yyyy-MM-dd HH:mm:ss" }}</span>
        }
      </div>

      <hr class="divider" />

      <div class="nav-links">
        @if (prev()) {
          <a [routerLink]="prev()!.route" class="nav-link prev">
            <span class="nav-label">上一页</span>
            <span class="nav-title">{{ prev()!.title }}</span>
          </a>
        } @else {
          <div></div>
        }
        @if (next()) {
          <a [routerLink]="next()!.route" class="nav-link next">
            <span class="nav-label">下一页</span>
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
      flex-wrap: wrap;
      gap: 12px;
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
      color: var(--mat-sys-on-surface-variant);
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
      padding: 24px;
      border-radius: 24px;
      background: var(--mat-sys-surface-container);
      text-decoration: none;
      border: 1px solid transparent;
      transition: border-radius var(--app-motion-spring), background-color var(--app-motion-fast);
      min-width: 0;
    }

    .nav-link:hover {
      border-color: var(--mat-sys-primary);
      background-color: var(--mat-sys-primary-container);
      border-radius: 32px 16px 32px 16px;
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
      overflow-wrap: anywhere;
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
	private readonly navService = inject(DocNavService);
	private readonly updatesCache = signal<Record<string, string>>({});
	private readonly currentRoute = toSignal(
		this.router.events.pipe(
			filter((event) => event instanceof NavigationEnd),
			map(() => normalizeDocRoute(this.router.url)),
		),
		{ initialValue: normalizeDocRoute(this.router.url) },
	);
	private readonly allPages = computed(() =>
		this.navService.sections().flatMap((s) => s.pages),
	);

	private readonly pageIndex = computed(() =>
		this.allPages().findIndex((page) => page.route === this.currentRoute()),
	);

	readonly prev = computed(() => {
		const index = this.pageIndex();
		return index > 0 ? this.allPages()[index - 1] : null;
	});

	readonly next = computed(() => {
		const pages = this.allPages();
		const index = this.pageIndex();
		return index >= 0 && index < pages.length - 1 ? pages[index + 1] : null;
	});

	readonly editUrl = computed(() => {
		const contentPath = routeToContentPath(this.currentRoute());
		return `https://github.com/Predidit/kazumi-website/edit/main/src/content/docs/${contentPath}.md`;
	});

	readonly lastUpdated = computed(
		() => this.updatesCache()[this.currentRoute()] ?? "",
	);

	constructor() {
		afterNextRender(() => {
			fetch("/doc-updates.json")
				.then((response) => response.json())
				.then((data: Record<string, string>) => this.updatesCache.set(data))
				.catch(() => {});
		});
	}
}
