import { Component, inject } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { ContributorsComponent } from "../../features/home/contributors";
import { SeoService } from "../../features/seo/seo.service";

@Component({
	selector: "app-community",
	imports: [MatIconModule, ContributorsComponent],
	template: `
    <div class="page-shell">
      <header class="community-hero"><div><span class="eyebrow">OPEN SOURCE, OPEN HEART</span><h1>好用的工具，<br />从热爱里长出来。</h1><p>Kazumi 是一个由社区共同构建的开源项目。<br />我们分享代码，也分享让它变得更好的想法。</p></div><mat-icon aria-hidden="true">favorite_border</mat-icon></header>
      <section class="join-grid" aria-label="参与社区">
        <a href="https://github.com/Predidit/Kazumi/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22" target="_blank" rel="noopener noreferrer"><mat-icon>code</mat-icon><h2>写下你的下一行</h2><p>从一个小改进开始，让想法变成新功能。</p><span>参与开发<mat-icon>north_east</mat-icon></span></a>
        <a href="https://github.com/Predidit/Kazumi/issues" target="_blank" rel="noopener noreferrer"><mat-icon>chat_bubble_outline</mat-icon><h2>让我们听到你的声音</h2><p>反馈问题、分享建议，一起把体验打磨好。</p><span>交流与反馈<mat-icon>north_east</mat-icon></span></a>
        <a href="https://t.me/kazumi_app" target="_blank" rel="noopener noreferrer"><mat-icon>forum</mat-icon><h2>找到同样喜欢的人</h2><p>来社区聊聊使用心得，交换灵感和发现。</p><span>加入 Telegram<mat-icon>north_east</mat-icon></span></a>
      </section>
      <app-contributors />
    </div>
  `,
	styles: `
    .community-hero { display: flex; align-items: center; justify-content: space-between; gap: 40px; padding: 48px; border-radius: 40px; background: var(--app-peach-container); color: var(--app-on-peach-container); }
    .community-hero .eyebrow { color: inherit; }
    h1 { margin: 24px 0; color: inherit; font-size: clamp(36px, 4.5vw, 60px); font-weight: 800; letter-spacing: -.05em; line-height: 1.35; }
    .community-hero p { font-size: 15px; line-height: 1.9; }
    .community-hero > mat-icon { width: 168px; height: 168px; font-size: 168px; margin-right: 32px; transform: rotate(-12deg); }
    .join-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 24px 0 80px; }
    .join-grid a { display: flex; flex-direction: column; align-items: flex-start; border-radius: 28px; padding: 32px; background: var(--mat-sys-surface-container); color: var(--mat-sys-on-surface); transition: border-radius var(--app-motion-spring), background var(--app-motion-fast); }
    .join-grid a:hover { border-radius: 40px 20px; background: var(--mat-sys-secondary-container); }
    .join-grid a > mat-icon { margin-bottom: 28px; color: var(--mat-sys-primary); width: 32px; height: 32px; font-size: 32px; }
    .join-grid h2 { font-size: 20px; letter-spacing: -.03em; }
    .join-grid p { font-size: 13px; line-height: 1.85; margin: 12px 0 24px; color: var(--mat-sys-on-surface-variant); }
    .join-grid span { display: flex; align-items: center; gap: 12px; font-size: 12px; font-weight: 600; margin-top: auto; color: var(--mat-sys-primary); }
    .join-grid span mat-icon { font-size: 18px; width: 18px; height: 18px; }
    @media (max-width: 900px) { .community-hero > mat-icon { width: 100px; height: 100px; font-size: 100px; margin-right: 0; } .join-grid a { padding: 24px; } }
    @media (max-width: 700px) { .community-hero { padding: 32px 24px; border-radius: 32px; } .community-hero > mat-icon { display: none; } .community-hero p { font-size: 14px; } .join-grid { grid-template-columns: 1fr; gap: 8px; margin: 16px 0 56px; } .join-grid a > mat-icon { margin-bottom: 20px; } }
  `,
})
export default class CommunityComponent {
	constructor() {
		inject(SeoService).setCommunity();
	}
}
