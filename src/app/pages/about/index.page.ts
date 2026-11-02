import { Component, inject } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { ContributorsComponent } from "../../features/home/contributors";
import { SeoService } from "../../features/seo/seo.service";

@Component({
	selector: "app-community",
	imports: [MatIconModule, ContributorsComponent],
	template: `
    <div class="page-shell">
      <header class="community-hero"><div><span class="eyebrow">关于项目与社区</span><h1>开源透明，<br />由社区共同维护。</h1><p>Kazumi 基于 GPL-3.0 协议开源。<br />无论是提交代码、编写规则、完善文档，还是反馈使用问题，都欢迎你的参与。</p></div><mat-icon aria-hidden="true">favorite_border</mat-icon></header>
      <section class="join-grid" aria-label="参与社区">
        <a href="https://github.com/Predidit/Kazumi/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22" target="_blank" rel="noopener noreferrer"><mat-icon>code</mat-icon><h2>参与代码开发</h2><p>浏览带有 good first issue 标签的待办任务，提交 Pull Request 改进功能或修复问题。</p><span>查看待办议题<mat-icon>north_east</mat-icon></span></a>
        <a href="https://github.com/Predidit/Kazumi/issues" target="_blank" rel="noopener noreferrer"><mat-icon>chat_bubble_outline</mat-icon><h2>问题反馈与建议</h2><p>遇到 Bug 或有新功能建议？欢迎前往 GitHub Issues 搜索已有讨论或提交反馈。</p><span>前往 GitHub Issues<mat-icon>north_east</mat-icon></span></a>
        <a href="https://t.me/kazumi_app" target="_blank" rel="noopener noreferrer"><mat-icon>forum</mat-icon><h2>社区日常交流</h2><p>加入 Telegram 群组，与其他用户交流使用体验、规则编写心得与版本动态。</p><span>加入 Telegram 群组<mat-icon>north_east</mat-icon></span></a>
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
