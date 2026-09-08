import { Component, inject } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import { DocNavService } from "../../features/docs/doc-nav.service";
import { DocSearchComponent } from "../../features/docs/doc-search";
import { SeoService } from "../../features/seo/seo.service";

@Component({
	selector: "app-guide-overview",
	imports: [MatIconModule, RouterLink, DocSearchComponent],
	template: `
    <div class="guide-overview">
      <header class="guide-hero"><div><span class="eyebrow">A GUIDE TO YOUR KAZUMI</span><h1>从第一步，<br />到得心应手。</h1><p>安装、探索，或动手创造。<br />你需要的下一步，就在这里。</p></div><div class="hero-search"><mat-icon class="guide-symbol" aria-hidden="true">auto_stories</mat-icon><app-doc-search /></div></header>
      <section class="guide-starts" aria-label="选择阅读起点">
        <a routerLink="/docs/intro/what-is-kazumi"><span class="start-icon"><mat-icon>waving_hand</mat-icon></span><span><h2>第一次使用</h2><p>认识 Kazumi，轻松开始。</p></span><mat-icon>arrow_forward</mat-icon></a>
        <a routerLink="/docs/rules/develop-rules"><span class="start-icon"><mat-icon>code</mat-icon></span><span><h2>想写自己的规则</h2><p>从选择器，到你的第一条规则。</p></span><mat-icon>arrow_forward</mat-icon></a>
        <a routerLink="/docs/misc/qa"><span class="start-icon"><mat-icon>help_outline</mat-icon></span><span><h2>需要一点帮助</h2><p>安装与使用问题，一起解决。</p></span><mat-icon>arrow_forward</mat-icon></a>
      </section>
      <div class="library-heading"><h2>按主题探索</h2><span>{{ pageCount }} 篇指南，随时翻阅</span></div>
      <div class="guide-library">
        @for (section of sections(); track section.title; let i = $index) {
          <section class="guide-section"><div class="section-title"><span>{{ '0' + (i + 1) }}</span><h2>{{ section.title }}</h2></div>
            @for (page of section.pages; track page.route) { <a [routerLink]="page.route"><mat-icon>{{ page.icon }}</mat-icon><span>{{ page.title }}</span><mat-icon>arrow_forward</mat-icon></a> }
          </section>
        }
      </div>
      <div class="guide-contribute"><mat-icon>edit_note</mat-icon><div><h2>好的指南，也需要你的经验。</h2><p>发现遗漏或想分享技巧？欢迎一起完善文档。</p></div><a href="https://github.com/Predidit/kazumi-website" target="_blank" rel="noopener noreferrer" class="text-action">参与编写<mat-icon>north_east</mat-icon></a></div>
    </div>
  `,
	styles: `
    .guide-hero { background: var(--mat-sys-primary-container); border-radius: 40px; padding: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; color: var(--mat-sys-on-primary-container); }
    h1 { color: inherit; font-size: clamp(36px, 4.8vw, 60px); font-weight: 800; letter-spacing: -.05em; margin: 20px 0; line-height: 1.3; }
    .guide-hero p { font-size: 15px; line-height: 1.9; }
    .hero-search { display: flex; flex-direction: column; justify-content: flex-end; gap: 30px; }
    .guide-symbol { width: 96px; height: 96px; font-size: 96px; align-self: flex-end; color: var(--mat-sys-primary); transform: rotate(-8deg); }
    .guide-starts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 16px 0 64px; }
    .guide-starts > a { display: flex; gap: 14px; align-items: center; padding: 24px; border-radius: 24px; background: var(--mat-sys-surface-container); color: var(--mat-sys-on-surface); transition: background var(--app-motion-fast); }
    .guide-starts > a:hover { background: var(--mat-sys-secondary-container); }
    .start-icon { width: 44px; height: 44px; border-radius: 16px; display: grid; place-items: center; flex-shrink: 0; color: var(--mat-sys-primary); background: var(--mat-sys-surface-container-lowest); }
    .guide-starts h2 { font-size: 14px; font-weight: 650; }
    .guide-starts p { font-size: 11px; color: var(--mat-sys-on-surface-variant); margin-top: 6px; }
    .guide-starts > a > mat-icon { margin-left: auto; width: 18px; height: 18px; font-size: 18px; }
    .library-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 24px; }
    .library-heading h2 { font-size: 28px; letter-spacing: -.04em; }
    .library-heading span { font-size: 12px; color: var(--mat-sys-on-surface-variant); }
    .guide-library { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .guide-section { background: var(--mat-sys-surface-container-low); border-radius: 28px; padding: 28px; }
    .section-title { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
    .section-title > span { color: var(--mat-sys-primary); font-size: 12px; }
    .section-title h2 { font-size: 20px; font-weight: 650; }
    .guide-section > a { display: flex; align-items: center; gap: 12px; padding: 14px 12px; border-radius: 14px; color: var(--mat-sys-on-surface-variant); font-size: 14px; }
    .guide-section > a:hover { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .guide-section > a > mat-icon { width: 20px; height: 20px; font-size: 20px; }
    .guide-section > a > mat-icon:last-child { margin-left: auto; width: 16px; height: 16px; font-size: 16px; }
    .guide-contribute { display: flex; align-items: center; gap: 24px; padding: 32px; margin-top: 32px; border-radius: 28px; background: var(--app-yellow-container); color: var(--app-on-yellow-container); }
    .guide-contribute > mat-icon { width: 40px; height: 40px; font-size: 40px; }
    .guide-contribute h2 { color: inherit; font-size: 18px; }
    .guide-contribute p { font-size: 12px; margin-top: 6px; }
    .guide-contribute a { margin-left: auto; color: inherit; white-space: nowrap; }
    @media (max-width: 1000px) { .guide-starts { grid-template-columns: 1fr; } }
    @media (max-width: 700px) { .guide-hero { padding: 32px 24px; grid-template-columns: 1fr; gap: 24px; border-radius: 32px; } .guide-symbol { display: none; } .guide-starts { margin-bottom: 40px; } .guide-library { grid-template-columns: 1fr; gap: 8px; } .guide-section { padding: 24px 20px; } .guide-contribute { flex-wrap: wrap; gap: 16px; padding: 24px; } .guide-contribute > mat-icon { display: none; } .guide-contribute a { margin-left: 0; } .library-heading h2 { font-size: 24px; } .library-heading span { font-size: 11px; } }
  `,
})
export default class GuideOverviewComponent {
	readonly sections = inject(DocNavService).sections;
	readonly pageCount = this.sections().reduce(
		(count, section) => count + section.pages.length,
		0,
	);
	constructor() {
		inject(SeoService).setGuide();
	}
}
