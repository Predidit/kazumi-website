import { isPlatformBrowser } from "@angular/common";
import {
	afterRenderEffect,
	Component,
	ElementRef,
	inject,
	input,
	output,
	PLATFORM_ID,
	signal,
	ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { TocItem } from "./docs-state.service";

@Component({
	selector: "app-toc",
	host: {
		"[class.embedded]": "embedded()",
	},
	template: `
    <nav class="toc" #tocContainer aria-label="本页内容">
      @if (items().length > 0) {
        <h4 class="toc-title">页面导航</h4>
        <ul class="toc-list">
          @for (item of items(); track item.id) {
            <li [style.padding-left.px]="(item.level - 1) * 16">
              <a
                class="toc-link"
                [href]="anchorUrl(item.id)"
                [class.active]="activeId() === item.id"
                [attr.aria-current]="activeId() === item.id ? 'location' : null"
                (click)="$event.preventDefault(); onLinkClick(item.id)"
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
      top: 0;
      max-height: calc(100vh - 128px);
      overflow-y: auto;
      scroll-behavior: smooth;
      padding-left: 12px;
      border-left: 1px solid var(--mat-sys-outline-variant);
      scrollbar-width: thin;
      scrollbar-color: var(--mat-sys-outline-variant) var(--mat-sys-surface-container);
    }

    .toc::-webkit-scrollbar {
      width: 6px;
    }

    .toc::-webkit-scrollbar-track {
      background: var(--mat-sys-surface-container);
    }

    .toc::-webkit-scrollbar-thumb {
      background-color: var(--mat-sys-outline-variant);
      border-radius: 3px;
    }

    .toc::-webkit-scrollbar-thumb:hover {
      background-color: var(--mat-sys-outline);
    }

    :host(.embedded) .toc {
      position: static;
      top: auto;
      max-height: none;
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
      padding: 10px 12px;
      font-size: 0.8125rem;
      color: var(--mat-sys-on-surface-variant);
      text-decoration: none;
      border-radius: 16px;
      line-height: 1.5;
      transition: color 0.15s, background-color 0.15s;
    }

    .toc-link:hover {
      color: var(--mat-sys-on-surface);
      background-color: color-mix(in srgb, var(--mat-sys-on-surface) 4%, transparent);
    }

    .toc-link.active {
      color: var(--mat-sys-on-primary-container);
      background-color: var(--mat-sys-primary-container);
      font-weight: 500;
    }
  `,
	],
})
export class TocComponent {
	readonly items = input<TocItem[]>([]);
	readonly embedded = input(false);
	readonly activeId = signal("");
	readonly linkClick = output<string>();
	@ViewChild("tocContainer") private tocContainer?: ElementRef<HTMLElement>;
	private observer?: IntersectionObserver;
	private readonly visibleIds = new Set<string>();

	private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private readonly router = inject(Router);

	constructor() {
		afterRenderEffect((onCleanup) => {
			this.items();
			this.setupObserver();
			onCleanup(() => this.observer?.disconnect());
		});

		afterRenderEffect(() => {
			this.activeId();
			this.scrollToActive();
		});
	}

	anchorUrl(id: string) {
		return `${this.router.url.split("#")[0]}#${encodeURIComponent(id)}`;
	}

	onLinkClick(id: string) {
		this.activeId.set(id);
		this.linkClick.emit(id);
		if (this.isBrowser) {
			document.getElementById(id)?.scrollIntoView({
				behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
					? "instant"
					: "smooth",
			});
			history.replaceState(history.state, "", this.anchorUrl(id));
		}
	}

	private scrollToActive() {
		const container = this.tocContainer?.nativeElement;
		if (!container) return;
		const link = container.querySelector(".toc-link.active");
		if (!link) return;
		const linkRect = link.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();
		if (
			linkRect.top < containerRect.top ||
			linkRect.bottom > containerRect.bottom
		) {
			container.scrollTop +=
				linkRect.top - containerRect.top - containerRect.height / 3;
		}
	}

	private setupObserver() {
		this.observer?.disconnect();
		this.visibleIds.clear();

		const ids = this.items().map((item) => item.id);
		const elements = ids
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => !!el);

		if (elements.length === 0) return;

		this.observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						this.visibleIds.add(entry.target.id);
					} else {
						this.visibleIds.delete(entry.target.id);
					}
				}

				if (this.visibleIds.size > 0) {
					const topmost = ids.find((id) => this.visibleIds.has(id));
					if (topmost) this.activeId.set(topmost);
				}
			},
			{ rootMargin: "-80px 0px -70% 0px", threshold: 0 },
		);

		for (const el of elements) {
			this.observer.observe(el);
		}
	}
}
