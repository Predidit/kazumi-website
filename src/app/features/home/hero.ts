import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";

@Component({
	selector: "app-hero",
	imports: [RouterLink, MatButtonModule, MatIconModule],
	template: `
    <div class="page-shell home-page">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <span class="eyebrow"><span class="status-dot"></span> 开源的，自由的，你的。</span>
          <h1 id="hero-title">喜欢的故事，<br /><span>自在地看。</span></h1>
          <p class="hero-description">从口袋里的小屏，到桌面上的大屏。</p>
          <div class="actions">
            <a mat-flat-button class="action action-large" routerLink="/download"><mat-icon>download</mat-icon>获取 Kazumi</a>
          </div>
          <div class="hero-meta"><span>免费使用</span><span>无广告</span><span>多平台支持</span></div>
        </div>
        <div class="hero-art">
          <div class="art-top"><span>HELLO, KAZUMI</span><mat-icon aria-hidden="true">filter_vintage</mat-icon></div>
          <picture class="mascot">
            <source type="image/webp" srcset="/kazumi-expressive-480.webp 480w, /kazumi-expressive-768.webp 768w, /kazumi-expressive-1024.webp 1024w, /kazumi-expressive-1254.webp 1254w" sizes="(max-width: 700px) calc(100vw - 80px), (max-width: 1000px) calc((100vw - 60px) / 2.3 - 48px), (max-width: 1360px) calc((100vw - 92px) / 2.3 - 64px), 488px" />
            <img src="/kazumi-expressive.png" width="1254" height="1254" alt="以柔和雕塑风格重新演绎的 Kazumi 绿发角色" fetchpriority="high" />
          </picture>
          <div class="art-bottom"><span>总有好故事，<br /><strong>等着与你相遇。</strong></span><a routerLink="/about/icon" class="art-link" aria-label="认识 Kazumi 的图标"><mat-icon>north_east</mat-icon></a></div>
        </div>
      </section>
      <div class="platform-strip" aria-label="支持的平台">
        <span class="platform-label">在你喜欢的设备上</span>
        @for (platform of platforms; track platform.name) {
          <a routerLink="/download" [queryParams]="{ platform: platform.id }"><span [class]="'mdi ' + platform.icon" aria-hidden="true"></span>{{ platform.name }}</a>
        }
      </div>
      <section class="experience-section" aria-labelledby="experience-title">
        <div class="section-heading"><div><span class="eyebrow">YOUR TIME, YOUR WAY</span><h2 id="experience-title">追番这件事，<br />可以更合心意。</h2></div><p>让工具安静地做好分内的事。<br />把选择，留给喜欢故事的你。</p></div>
        <div class="feature-grid">
          <a routerLink="/docs/rules/introduce-rules" class="feature feature-rules">
            <div class="feature-top"><span class="feature-icon"><mat-icon>tune</mat-icon></span><mat-icon>north_east</mat-icon></div>
            <div><span class="feature-index">01 / 自定义规则</span><h3>观看方式，<br />由你定义。</h3><p>导入、分享，或从头编写自己的规则。<br />让内容来源适应你的习惯。</p></div>
          </a>
          <a routerLink="/docs/intro/module-details" class="feature feature-watch">
            <div class="feature-top"><span class="feature-icon"><mat-icon>auto_awesome</mat-icon></span><mat-icon>north_east</mat-icon></div>
            <div><span class="feature-index">02 / 沉浸体验</span><h3>每个精彩，<br />都值得看清。</h3><p>实时超分辨率、弹幕与一起看。<br />一个人沉浸，也可以一起共鸣。</p></div>
          </a>
          <a routerLink="/about" class="feature feature-open">
            <div class="feature-top"><span class="feature-icon"><mat-icon>favorite_border</mat-icon></span><mat-icon>north_east</mat-icon></div>
            <div><span class="feature-index">03 / 开源共创</span><h3>因为热爱，<br />所以开放。</h3><p>基于 GPL-3.0 开源。<br />每一份贡献，都让 Kazumi 更好一点。</p></div>
          </a>
        </div>
      </section>
      <section class="start-section" aria-labelledby="start-title">
        <div><span class="eyebrow">MAKE YOURSELF AT HOME</span><h2 id="start-title">下一段故事，从这里开始。</h2><p>选好设备，装好应用。剩下的，交给好故事。</p></div>
        <a mat-flat-button class="action action-large" routerLink="/download">选择你的版本<mat-icon iconPositionEnd>arrow_forward</mat-icon></a>
      </section>
      <div class="help-links"><a routerLink="/docs">需要一点指引？<strong>打开使用指南</strong><mat-icon>arrow_forward</mat-icon></a><a href="https://github.com/Predidit/Kazumi" target="_blank" rel="noopener noreferrer">想让它变得更好？<strong>一起参与共创</strong><mat-icon>north_east</mat-icon></a></div>
    </div>
  `,
	styles: `
    .home-page { padding-top: 12px; }
    .hero { display: grid; grid-template-columns: 1.3fr 1fr; gap: 12px; }
    .hero-copy { min-width: 0; background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); border-radius: 40px 16px 16px 40px; padding: clamp(32px, 4.2vw, 64px); display: flex; flex-direction: column; justify-content: center; }
    .hero-copy .eyebrow { color: inherit; }
    h1 { font-size: clamp(44px, 5.4vw, 80px); line-height: 1.23; letter-spacing: -0.065em; font-weight: 800; margin: 28px 0 20px; color: inherit; }
    h1 > span { color: var(--mat-sys-primary); }
    .hero-description { font-size: 17px; line-height: 1.8; opacity: .85; }
    .actions { display: flex; align-items: center; margin-top: 32px; }
    .hero-meta { display: flex; gap: 20px; margin-top: 24px; font-size: 12px; opacity: .75; }
    .hero-meta span + span::before { content: '/'; margin-right: 20px; opacity: .5; }
    .hero-art { border-radius: 16px 40px 40px 16px; background: var(--app-yellow-container); color: var(--app-on-yellow-container); padding: 28px 32px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; overflow: hidden; }
    .art-top, .art-bottom { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .art-top { font: 600 11px var(--app-display-font); letter-spacing: 2px; }
    .art-top mat-icon { font-size: 38px; width: 38px; height: 38px; }
    .mascot { display: block; width: 100%; margin: 20px 0; border-radius: 28px; transition: transform var(--app-motion-spring); }
    .mascot img { width: 100%; border-radius: inherit; }
    .hero-art:hover .mascot { transform: scale(1.025); }
    .art-bottom { font-size: 14px; line-height: 1.7; }
    .art-bottom strong { font-weight: 600; }
    .art-link { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; color: inherit; background: color-mix(in srgb, var(--app-on-yellow-container) 9%, transparent); transition: border-radius var(--app-motion-spring); }
    .art-link:hover { border-radius: 16px; }
    .platform-strip { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px 20px; padding: 28px 16px; }
    .platform-label { color: var(--mat-sys-on-surface-variant); font-size: 12px; }
    .platform-strip a { display: flex; gap: 8px; align-items: center; min-height: 44px; color: var(--mat-sys-on-surface-variant); font-size: 13px; }
    .platform-strip a:hover { color: var(--mat-sys-primary); }
    .platform-strip .mdi { font-size: 22px; }
    .experience-section { margin-top: 64px; }
    .section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; margin-bottom: 32px; }
    h2 { font-size: clamp(28px, 3.2vw, 44px); font-weight: 700; line-height: 1.4; letter-spacing: -.04em; margin-top: 14px; }
    .section-heading > p { font-size: 15px; line-height: 1.9; color: var(--mat-sys-on-surface-variant); }
    .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .feature { min-height: 352px; padding: 30px; display: flex; flex-direction: column; justify-content: space-between; gap: 32px; color: var(--mat-sys-on-surface); border-radius: 32px; transition: border-radius var(--app-motion-spring), transform var(--app-motion-spring); }
    .feature:hover { border-radius: 48px 20px 48px 20px; transform: translateY(-4px); }
    .feature-rules { background: var(--mat-sys-surface-container); }
    .feature-watch { background: var(--app-peach-container); color: var(--app-on-peach-container); }
    .feature-open { background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); }
    .feature-top { display: flex; justify-content: space-between; align-items: center; }
    .feature-top > mat-icon { width: 20px; height: 20px; font-size: 20px; }
    .feature-icon { display: grid; place-items: center; width: 60px; height: 60px; border-radius: 20px; background: color-mix(in srgb, currentColor 8%, transparent); }
    .feature-icon mat-icon { font-size: 30px; width: 30px; height: 30px; }
    .feature-index { font-size: 11px; letter-spacing: .06em; opacity: .75; }
    .feature h3 { font-size: 29px; font-weight: 650; letter-spacing: -.04em; line-height: 1.4; margin-top: 12px; color: inherit; }
    .feature p { font-size: 13px; line-height: 1.85; margin-top: 16px; opacity: .85; }
    .start-section { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); border-radius: 40px; padding: 48px; margin-top: 80px; display: flex; justify-content: space-between; align-items: center; gap: 32px; }
    .start-section h2 { color: inherit; font-size: clamp(26px, 2.8vw, 38px); }
    .start-section p { margin-top: 12px; font-size: 14px; }
    .start-section .action { flex-shrink: 0; }
    .help-links { display: flex; justify-content: space-between; gap: 20px; padding: 24px 16px 0; }
    .help-links a { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; min-height: 44px; color: var(--mat-sys-on-surface-variant); font-size: 12px; }
    .help-links strong { color: var(--mat-sys-primary); font-weight: 500; }
    .help-links mat-icon { font-size: 16px; width: 16px; height: 16px; }
    @media (max-width: 1000px) { .hero-copy { padding: 36px; } .hero-art { padding: 24px; } .hero-meta { gap: 12px; } .hero-meta span + span::before { margin-right: 12px; } .feature { padding: 24px; } .platform-label { width: 100%; } }
    @media (max-width: 700px) {
      .hero { grid-template-columns: 1fr; gap: 8px; }
      .hero-copy { border-radius: 32px 32px 12px 12px; padding: 32px 26px; }
      h1 { font-size: clamp(40px, 10vw, 64px); margin: 24px 0 20px; }
      .hero-description { font-size: 14px; }
      .actions { margin-top: 28px; }
      .hero-art { border-radius: 12px 12px 32px 32px; padding: 20px 24px; }
      .mascot { margin: 16px 0; border-radius: 20px; }
      .art-bottom { align-items: flex-end; }
      .art-bottom > span { position: relative; z-index: 1; width: 130px; margin-bottom: 16px; }
      .art-link { z-index: 1; width: 44px; height: 44px; }
      .art-top mat-icon { width: 28px; height: 28px; font-size: 28px; }
      .platform-strip { padding: 24px 10px; justify-content: flex-start; gap: 8px 20px; }
      .platform-strip a { font-size: 12px; }
      .experience-section { margin-top: 40px; }
      .section-heading { flex-direction: column; align-items: flex-start; gap: 18px; }
      .section-heading > p { font-size: 14px; }
      .feature-grid { grid-template-columns: 1fr; gap: 8px; }
      .feature { min-height: 290px; padding: 28px; gap: 24px; }
      .feature h3 br { display: none; }
      .feature h3 { font-size: 28px; }
      .start-section { padding: 32px 26px; margin-top: 48px; flex-direction: column; align-items: flex-start; border-radius: 32px; }
      .help-links { flex-direction: column; gap: 0; padding: 16px 8px 0; }
    }
  `,
})
export class HeroComponent {
	readonly platforms = [
		{ id: "android", name: "Android", icon: "mdi-android" },
		{ id: "ios", name: "iOS", icon: "mdi-apple" },
		{ id: "windows", name: "Windows", icon: "mdi-microsoft-windows" },
		{ id: "mac", name: "macOS", icon: "mdi-laptop" },
		{ id: "linux", name: "Linux", icon: "mdi-linux" },
		{ id: "ohos", name: "HarmonyOS", icon: "mdi-cellphone" },
	];
}
