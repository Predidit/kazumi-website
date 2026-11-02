import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import { SeoService } from "../features/seo/seo.service";

@Component({
	selector: "app-not-found",
	imports: [RouterLink, MatButtonModule, MatIconModule],
	template: `
    <div class="page-shell">
      <section class="missing-page">
        <span class="eyebrow">404</span>
        <h1>未找到该页面</h1>
        <p>你访问的页面不存在，可能已被移动或链接输入有误。</p>
        <div class="actions">
          <a mat-flat-button class="action" routerLink="/">返回首页<mat-icon iconPositionEnd>arrow_forward</mat-icon></a>
          <a class="text-action" routerLink="/docs">查看使用文档<mat-icon>auto_stories</mat-icon></a>
        </div>
      </section>
    </div>
  `,
	styles: `
    .missing-page { padding: clamp(32px, 6vw, 80px); border-radius: 32px; background: var(--mat-sys-surface-container); }
    h1 { margin: 24px 0; font-size: clamp(28px, 4vw, 48px); letter-spacing: -.04em; }
    p { max-width: 520px; color: var(--mat-sys-on-surface-variant); }
    .actions { display: flex; align-items: center; flex-wrap: wrap; gap: 16px 24px; margin-top: 32px; }
  `,
})
export default class NotFoundComponent {
	constructor() {
		inject(SeoService).setNotFound();
	}
}
