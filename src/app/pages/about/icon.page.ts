import { Component, inject } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import { SeoService } from "../../features/seo/seo.service";

@Component({
	selector: "app-icon-page",
	imports: [MatIconModule, RouterLink],
	template: `
    <div class="page-shell icon-page">
      <a routerLink="/about" class="text-action"><mat-icon>arrow_back</mat-icon>回到共创社区</a>
      <header class="page-intro"><span class="eyebrow">THE FACE OF KAZUMI</span><h1>一眼相识，<br />也记得创作它的人。</h1><p>关于 Kazumi 图标的故事与授权。</p></header>
      <div class="icon-story">
        <figure><img src="/kazumi-expressive.png" alt="基于原项目形象生成的 Kazumi 风格化插画" width="1254" height="1254" /><figcaption>网站风格化插画 · 基于原项目形象重新演绎</figcaption></figure>
        <div class="story-copy"><span class="eyebrow">MEET THE ARTIST</span><h2>感谢 Yuquanaaa。</h2><p>Kazumi 原项目图标来自 Yuquanaaa 发表在 Pixiv 上的作品。本站展示的是基于原形象、使用 AI 生成的风格化插画；原始作品可通过下方链接查看。</p>
          <div class="artist-links"><a href="https://www.pixiv.net/users/66219277" target="_blank" rel="noopener noreferrer" class="text-action">认识创作者<mat-icon>north_east</mat-icon></a><a href="https://www.pixiv.net/artworks/116666979" target="_blank" rel="noopener noreferrer" class="text-action">查看原作<mat-icon>north_east</mat-icon></a></div>
          <div class="permission-note"><mat-icon>verified_user</mat-icon><div><h3>尊重创作，也尊重授权。</h3><p>图标版权归原作者所有。Kazumi 已获得原作者授权，允许在本项目中使用。</p><p>这一授权不代表图标可自由使用。未经原作者明确许可，请勿使用、复制、修改或分发。</p></div></div>
        </div>
      </div>
    </div>
  `,
	styles: `
    .icon-page { max-width: 1200px; }
    .icon-story { display: grid; grid-template-columns: .85fr 1.15fr; gap: 48px; align-items: center; }
    figure { background: var(--app-yellow-container); border-radius: 40px; padding: 40px; }
    figure img { width: 100%; max-width: 340px; margin: auto; }
    figcaption { margin-top: 28px; color: var(--app-on-yellow-container); font-size: 11px; text-align: center; }
    .story-copy h2 { font-size: 32px; margin: 20px 0; letter-spacing: -.04em; }
    .story-copy > p { font-size: 15px; line-height: 1.95; color: var(--mat-sys-on-surface-variant); }
    .artist-links { display: flex; gap: 24px; margin: 16px 0 28px; }
    .permission-note { display: flex; gap: 16px; background: var(--mat-sys-surface-container); border-radius: 24px; padding: 24px; }
    .permission-note > mat-icon { color: var(--mat-sys-primary); }
    .permission-note h3 { font-size: 15px; font-weight: 650; margin-bottom: 12px; }
    .permission-note p { font-size: 12px; line-height: 1.9; color: var(--mat-sys-on-surface-variant); }
    .permission-note p + p { margin-top: 10px; }
    @media (max-width: 700px) { .icon-story { grid-template-columns: 1fr; gap: 32px; } figure { padding: 28px; border-radius: 32px; } figure img { max-width: 230px; } .story-copy { padding: 0 8px; } }
  `,
})
export default class IconPageComponent {
	constructor() {
		inject(SeoService).setIcon();
	}
}
