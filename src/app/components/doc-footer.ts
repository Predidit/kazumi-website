import { Component, inject, signal } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { filter } from "rxjs/operators";

interface DocPage {
	route: string;
	title: string;
}

@Component({
	selector: "app-doc-footer",
	imports: [RouterLink, MatIconModule],
	template: `
    <div class="doc-footer">
      <div class="edit-bar">
        <a [href]="editUrl()" target="_blank" rel="noopener noreferrer" class="edit-link">
          <mat-icon>edit</mat-icon>
          帮助我们改进本页面内容
        </a>
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
      justify-content: flex-start;
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
	private router = inject(Router);

	prev = signal<DocPage | null>(null);
	next = signal<DocPage | null>(null);
	editUrl = signal("");

	private pages: DocPage[] = [
		{ route: "/docs/intro/what-is-kazumi", title: "Kazumi 是什么？" },
		{ route: "/docs/intro/how-to-download", title: "如何下载" },
		{ route: "/docs/intro/screenshots", title: "软件界面" },
		{ route: "/docs/intro/module-details", title: "功能模块" },
		{ route: "/docs/rules/introduce-rules", title: "规则介绍" },
		{ route: "/docs/rules/develop-rules", title: "规则开发" },
		{ route: "/docs/rules/develop-rules-example", title: "规则示例" },
		{ route: "/docs/architecture/video-parser", title: "视频嗅探" },
		{ route: "/docs/architecture/bbcode", title: "BBCode 解析" },
		{ route: "/docs/misc/qa", title: "常见问题" },
		{ route: "/docs/misc/how-to-install-in-ios", title: "iOS 自签" },
		{ route: "/docs/misc/how-to-install-in-ohos", title: "OHOS 侧载" },
	];

	constructor() {
		this.router.events
			.pipe(filter((e) => e instanceof NavigationEnd))
			.subscribe(() => this.update());

		this.update();
	}

	private update() {
		const url = this.router.url;
		const idx = this.pages.findIndex((p) => p.route === url);

		if (idx > 0) {
			this.prev.set(this.pages[idx - 1]);
		} else {
			this.prev.set(null);
		}

		if (idx >= 0 && idx < this.pages.length - 1) {
			this.next.set(this.pages[idx + 1]);
		} else {
			this.next.set(null);
		}

		const contentPath = url.replace("/docs/", "");
		this.editUrl.set(
			`https://github.com/Predidit/kazumi-website/edit/angular/src/content/docs/${contentPath}.md`,
		);
	}
}
