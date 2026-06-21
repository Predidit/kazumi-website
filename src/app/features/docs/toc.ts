import { Component, input, output, signal } from "@angular/core";
import { TocItem } from "./docs-state.service";

const TOC_TITLE = "页面导航";

@Component({
	selector: "app-toc",
	standalone: true,
	host: {
		"[class.embedded]": "embedded()",
	},
	template: `
    <nav class="toc">
      @if (items().length > 0) {
        <h4 class="toc-title">{{ title }}</h4>
        <ul class="toc-list">
          @for (item of items(); track item.id) {
            <li [style.padding-left.px]="(item.level - 1) * 16">
              <a
                [href]="'#' + item.id"
                class="toc-link"
                [class.active]="activeId() === item.id"
                (click)="onLinkClick(item.id)"
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
	readonly title = TOC_TITLE;
	readonly linkClick = output<string>();

	onLinkClick(id: string) {
		this.activeId.set(id);
		this.linkClick.emit(id);
	}
}
