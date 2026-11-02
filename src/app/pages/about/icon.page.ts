import { Component, inject } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import { SeoService } from "../../features/seo/seo.service";

@Component({
	selector: "app-icon-page",
	imports: [MatIconModule, RouterLink],
	template: `
    <div class="page-shell icon-page">
      <a routerLink="/about" class="text-action"><mat-icon>arrow_back</mat-icon>返回关于页面</a>
      <header class="page-intro"><span class="eyebrow">图标与版权说明</span><h1>关于 Kazumi 图标</h1><p>项目图标的原作来源、网站插画说明与版权许可。</p></header>
      <div class="icon-story">
        <figure><img src="/kazumi-expressive.png" alt="Kazumi 网站角色插画" width="1254" height="1254" /><figcaption>本站角色插画 · 基于原项目图标形象衍生重绘</figcaption></figure>
        <div class="story-copy"><span class="eyebrow">原作信息</span><h2>原作者：Yuquanaaa</h2><p>Kazumi 的应用图标源自画师 Yuquanaaa 发布于 Pixiv 的插画作品。本站展示的立体风格插画是以原角色形象为参考、使用 AI 生成的衍生视觉图，原作品可通过下方链接查看。</p>
          <div class="artist-links"><a href="https://www.pixiv.net/users/66219277" target="_blank" rel="noopener noreferrer" class="text-action">作者 Pixiv 主页<mat-icon>north_east</mat-icon></a><a href="https://www.pixiv.net/artworks/116666979" target="_blank" rel="noopener noreferrer" class="text-action">查看原作品<mat-icon>north_east</mat-icon></a></div>
          <div class="permission-note"><mat-icon>verified_user</mat-icon><div><h3>版权与授权说明</h3><p>原图标的著作权归原作者 Yuquanaaa 所有。Kazumi 项目已获得原作者授权，可在应用及相关项目页面中使用该形象。</p><p>该授权仅限 Kazumi 项目使用，并非公开自由授权。未经原作者明确许可，任何第三方不得擅自使用、复制、修改或分发该图标。</p></div></div>
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
