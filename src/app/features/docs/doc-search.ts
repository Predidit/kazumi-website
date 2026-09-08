import { Component, computed, inject, signal } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import { DocNavService } from "./doc-nav.service";

@Component({
	selector: "app-doc-search",
	imports: [MatIconModule, RouterLink],
	template: `
    <div class="search-field"><mat-icon>search</mat-icon><input type="search" aria-label="搜索指南标题" placeholder="搜索指南标题…" [value]="query()" (input)="query.set($any($event.target).value)" />
      @if (query()) { <button type="button" aria-label="清空搜索" (click)="query.set('')"><mat-icon>close</mat-icon></button> }
    </div>
    @if (query().trim()) {
      <div class="search-results">
        <p role="status">{{ results().length ? '找到 ' + results().length + ' 篇指南' : '没有匹配的指南，试试「安装」或「规则」' }}</p>
        @for (page of results(); track page.route) {
          <a [routerLink]="page.route" (click)="query.set('')"><mat-icon>{{ page.icon }}</mat-icon><span>{{ page.title }}<small>{{ page.section }}</small></span><mat-icon>arrow_forward</mat-icon></a>
        }
      </div>
    }
  `,
	styles: `
    :host { display: block; position: relative; }
    .search-field { display: flex; align-items: center; gap: 12px; border-radius: 28px; min-height: 52px; padding: 4px 18px; background: var(--mat-sys-surface-container-high); color: var(--mat-sys-on-surface-variant); }
    .search-field:focus-within { outline: 2px solid var(--mat-sys-primary); outline-offset: 2px; }
    input { min-width: 0; width: 100%; background: transparent; color: var(--mat-sys-on-surface); border: 0; outline: 0; font-size: 14px; height: 44px; }
    input::placeholder { color: var(--mat-sys-on-surface-variant); }
    input::-webkit-search-cancel-button { display: none; }
    button { display: grid; place-items: center; flex-shrink: 0; width: 40px; height: 40px; border: 0; border-radius: 50%; background: transparent; color: inherit; }
    .search-results { margin-top: 10px; padding: 12px; background: var(--mat-sys-surface-container-low); border-radius: 20px; border: 1px solid var(--mat-sys-outline-variant); }
    .search-results p { font-size: 12px; color: var(--mat-sys-on-surface-variant); padding: 4px 8px 12px; }
    .search-results a { display: flex; gap: 12px; align-items: center; padding: 12px; border-radius: 12px; color: var(--mat-sys-on-surface); font-size: 14px; }
    .search-results a:hover { background: var(--mat-sys-primary-container); }
    .search-results a > mat-icon:last-child { margin-left: auto; font-size: 18px; width: 18px; height: 18px; }
    small { display: block; font-size: 11px; color: var(--mat-sys-on-surface-variant); margin-top: 3px; }
  `,
})
export class DocSearchComponent {
	readonly query = signal("");
	private readonly nav = inject(DocNavService);
	readonly results = computed(() => {
		const query = this.query().trim().toLocaleLowerCase();
		return this.nav
			.sections()
			.flatMap((section) =>
				section.pages.map((page) => ({ ...page, section: section.title })),
			)
			.filter((page) =>
				`${page.title} ${page.section}`.toLocaleLowerCase().includes(query),
			);
	});
}
