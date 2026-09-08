import { Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";

@Component({
	selector: "app-footer",
	imports: [RouterLink, MatIconModule],
	template: `
    <footer class="site-footer">
      <div class="footer-top">
        <div class="footer-brand"><a routerLink="/">Kazumi.</a><p>为故事停留，为热爱相遇。</p></div>
        <nav aria-label="页脚导航">
          <a routerLink="/download">获取应用</a><a routerLink="/docs">使用指南</a><a routerLink="/about">参与共创</a><a routerLink="/about/icon">图标与授权</a>
        </nav>
        <a class="community-link" href="https://t.me/kazumi_app" target="_blank" rel="noopener noreferrer">加入 Telegram <mat-icon>north_east</mat-icon></a>
      </div>
      <div class="footer-bottom"><span>由开源社区用心构建</span><span>© {{ year }} Kazumi · 网站基于 MIT 协议开源</span></div>
    </footer>
  `,
	styles: `
    .site-footer { margin: 32px auto 0; max-width: 1360px; padding: 48px 40px 24px; border-top: 1px solid var(--mat-sys-outline-variant); }
    .footer-top { display: flex; align-items: center; justify-content: space-between; gap: 32px; }
    .footer-brand a { font-family: var(--app-display-font); font-size: 32px; font-weight: 800; letter-spacing: -1.5px; color: var(--mat-sys-on-surface); }
    .footer-brand p { margin-top: 8px; color: var(--mat-sys-on-surface-variant); font-size: 13px; }
    nav { display: flex; flex-wrap: wrap; gap: 8px 24px; }
    nav a, .community-link { font-size: 13px; color: var(--mat-sys-on-surface); min-height: 44px; display: inline-flex; align-items: center; }
    nav a:hover, .community-link:hover { color: var(--mat-sys-primary); text-decoration: underline; text-underline-offset: 5px; }
    .community-link { gap: 10px; }
    .community-link mat-icon { width: 18px; height: 18px; font-size: 18px; }
    .footer-bottom { display: flex; justify-content: space-between; gap: 12px; margin-top: 40px; color: var(--mat-sys-on-surface-variant); font-size: 11px; }
    @media (max-width: 950px) { .footer-top { flex-wrap: wrap; } }
    @media (max-width: 700px) { .site-footer { padding: 32px 24px; } .footer-top { align-items: flex-start; flex-direction: column; gap: 20px; } .footer-bottom { flex-direction: column; margin-top: 24px; } }
  `,
})
export class FooterComponent {
	readonly year = new Date().getFullYear();
}
