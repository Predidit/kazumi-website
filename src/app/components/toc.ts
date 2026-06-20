import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
	afterNextRender,
	Component,
	inject,
	OnDestroy,
	PLATFORM_ID,
	signal,
} from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { filter } from "rxjs/operators";

interface TocItem {
	id: string;
	text: string;
	level: number;
}

@Component({
	selector: "app-toc",
	standalone: true,
	imports: [CommonModule],
	template: `
    <nav class="toc">
      @if (items().length > 0) {
        <h4 class="toc-title">页面导航</h4>
        <ul class="toc-list">
          @for (item of items(); track item.id) {
            <li [style.padding-left.px]="(item.level - 1) * 16">
              <a
                [href]="'#' + item.id"
                class="toc-link"
                [class.active]="activeId() === item.id"
                (click)="scrollTo($event, item.id)"
              >
                {{ item.text }}
              </a>
            </li>
          }
        </ul>
      }
    </nav>
  `,
	styles: [
		`
    .toc {
      position: sticky;
      top: 96px;
      max-height: calc(100vh - 128px);
      overflow-y: auto;
      padding-left: 24px;
      border-left: 1px solid var(--mat-sys-outline-variant);
    }

    .toc-title {
      margin: 0 0 12px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .toc-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .toc-list li {
      margin: 0;
    }

    .toc-link {
      display: block;
      padding: 4px 8px;
      font-size: 0.8125rem;
      color: var(--mat-sys-on-surface-variant);
      text-decoration: none;
      border-radius: 4px;
      line-height: 1.5;
      transition: color 0.15s, background-color 0.15s;
    }

    .toc-link:hover {
      color: var(--mat-sys-on-surface);
      background-color: var(--mat-sys-surface-container);
    }

    .toc-link.active {
      color: var(--mat-sys-primary);
      background-color: var(--mat-sys-primary-container);
      font-weight: 500;
    }
  `,
	],
})
export class TocComponent implements OnDestroy {
	items = signal<TocItem[]>([]);
	activeId = signal<string>("");

	private observer: IntersectionObserver | null = null;
	private platformId = inject(PLATFORM_ID);
	private router = inject(Router);
	private sub: Subscription;

	constructor() {
		this.sub = this.router.events
			.pipe(filter((e) => e instanceof NavigationEnd))
			.subscribe(() => {
				setTimeout(() => this.extract(), 50);
			});

		afterNextRender(() => this.extract());
	}

	ngOnDestroy() {
		this.observer?.disconnect();
		this.sub.unsubscribe();
	}

	scrollTo(event: Event, id: string) {
		event.preventDefault();
		if (!isPlatformBrowser(this.platformId)) return;
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "start" });
			this.activeId.set(id);
		}
	}

	private extract() {
		if (!isPlatformBrowser(this.platformId)) return;
		const container = document.querySelector(".analog-markdown-route");
		if (!container) return;

		const headings = container.querySelectorAll("h1, h2, h3, h4");
		const items: TocItem[] = [];

		headings.forEach((h) => {
			if (!h.id)
				h.id = h.textContent?.trim().replace(/\s+/g, "-").toLowerCase() || "";
			items.push({
				id: h.id,
				text: h.textContent?.trim() || "",
				level: parseInt(h.tagName.charAt(1), 10),
			});
		});

		this.items.set(items);
		this.setupObserver(container);
	}

	private setupObserver(container: Element) {
		this.observer?.disconnect();

		this.observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						this.activeId.set(entry.target.id);
					}
				}
			},
			{ rootMargin: "-80px 0px -80% 0px", threshold: 0 },
		);

		for (const h of container.querySelectorAll("h1, h2, h3, h4")) {
			this.observer?.observe(h);
		}
	}
}
