import { isPlatformBrowser } from "@angular/common";
import { afterNextRender, Component, inject, PLATFORM_ID } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";

interface Feature {
	icon: string;
	title: string;
	description: string;
}

@Component({
	selector: "app-hero",
	imports: [RouterLink, MatButtonModule, MatIconModule],
	template: `
    <section class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">Kazumi</h1>
          <p class="hero-tagline">
            使用 Flutter 开发的基于自定义规则的番剧采集与在线观看程序
          </p>
          <p class="hero-subtitle">绝赞开发中 ～</p>
          <div class="hero-actions">
            <a mat-fab extended routerLink="/download" class="fab-primary">
              <mat-icon>download</mat-icon>
              立即下载
            </a>
            <a mat-fab extended routerLink="/docs/intro/what-is-kazumi" class="fab-secondary">
              <mat-icon>menu_book</mat-icon>
              了解更多
            </a>
          </div>
        </div>
        <div class="hero-visual">
          <img src="/logo.png" alt="Kazumi" class="hero-logo" />
        </div>
      </div>

      <div class="features-grid">
        @for (feature of features; track feature.title) {
          <div class="feature-card">
            <div class="icon-wrapper">
              <mat-icon>{{ feature.icon }}</mat-icon>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.description }}</p>
          </div>
        }
      </div>

      <div class="scroll-hint" (click)="scrollDown()">
        <mat-icon>expand_more</mat-icon>
      </div>
    </section>
    <div id="after-hero"></div>
  `,
	styles: `
    .hero {
      position: relative;
      min-height: calc(100vh - 64px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 80px 48px;
      background-color: var(--mat-sys-surface);
    }

    .hero-container {
      width: 100%;
      max-width: 1080px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 64px;
    }

    .hero-content {
      flex: 1;
      min-width: 0;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 16px;
      color: var(--mat-sys-on-surface);
      letter-spacing: -1px;
      line-height: 1.1;
    }

    .hero-tagline {
      font-size: 1.25rem;
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 8px;
      line-height: 1.6;
    }

    .hero-subtitle {
      font-size: 1rem;
      color: var(--mat-sys-outline);
      margin-bottom: 40px;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .fab-primary {
      --md-fab-container-color: var(--mat-sys-primary);
      --md-fab-icon-color: var(--mat-sys-on-primary);
    }

    .fab-secondary {
      --md-fab-container-color: var(--mat-sys-secondary-container);
      --md-fab-icon-color: var(--mat-sys-on-secondary-container);
    }

    .hero-visual {
      flex-shrink: 0;
    }

    .hero-logo {
      width: 240px;
      height: 240px;
      border-radius: 32px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      width: 100%;
      max-width: 1080px;
      margin: 64px auto 0;
    }

    .feature-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 32px 24px;
      border-radius: 16px;
      background-color: var(--mat-sys-surface-container-low);
      transition: background-color 0.2s, transform 0.2s;
    }

    .feature-card:hover {
      background-color: color-mix(in srgb, var(--mat-sys-on-surface) 4%, transparent);
      transform: translateY(-2px);
    }

    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background-color: var(--mat-sys-primary-container);
      margin-bottom: 16px;
    }

    .icon-wrapper mat-icon {
      color: var(--mat-sys-on-primary-container);
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .feature-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--mat-sys-on-surface);
    }

    .feature-desc {
      font-size: 0.8125rem;
      color: var(--mat-sys-on-surface-variant);
      margin: 0;
      line-height: 1.6;
    }

    .scroll-hint {
      position: absolute;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      color: var(--mat-sys-on-surface-variant);
      cursor: pointer;
      animation: bounce 2s ease-in-out infinite;
      transition: color 0.2s;
    }

    .scroll-hint:hover {
      color: var(--mat-sys-on-surface);
    }

    .scroll-hint mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    @keyframes bounce {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(8px); }
    }

    @media (max-width: 768px) {
      .hero {
        min-height: auto;
        padding: 64px 24px;
      }

      .hero-container {
        flex-direction: column-reverse;
        gap: 32px;
        text-align: center;
      }

      .hero-logo {
        width: 160px;
        height: 160px;
        border-radius: 28px;
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .hero-tagline {
        font-size: 1.0625rem;
      }

      .hero-actions {
        justify-content: center;
      }

      .features-grid {
        grid-template-columns: 1fr;
        gap: 16px;
        margin-top: 48px;
      }

      .feature-card {
        flex-direction: row;
        text-align: left;
        gap: 16px;
        padding: 24px;
      }

      .icon-wrapper {
        flex-shrink: 0;
        margin-bottom: 0;
      }

      .scroll-hint {
        display: none;
      }
    }
  `,
})
export class HeroComponent {
	private platformId = inject(PLATFORM_ID);

	features: Feature[] = [
		{
			icon: "devices",
			title: "全平台支持",
			description: "支持所有主流桌面、移动平台，包括鸿蒙 NEXT",
		},
		{
			icon: "auto_awesome",
			title: "功能丰富",
			description: "支持弹幕、实时超分辨率、一起看等超多功能",
		},
		{
			icon: "code",
			title: "开源免费",
			description: "基于 GPL 3.0 协议开源，免费无广告",
		},
	];

	constructor() {
		afterNextRender(() => {
			if (!isPlatformBrowser(this.platformId)) return;

			let locked = false;
			const hero = document.querySelector(".hero");
			const target = document.getElementById("after-hero");

			const onWheel = (e: WheelEvent) => {
				if (!hero || !target || locked) return;
				const bottom = hero.getBoundingClientRect().bottom;
				if (bottom <= window.innerHeight + 10 && e.deltaY > 0) {
					e.preventDefault();
					locked = true;
					target.scrollIntoView({ behavior: "smooth" });
					setTimeout(() => (locked = false), 1000);
				}
			};

			hero?.addEventListener("wheel", onWheel as EventListener, {
				passive: false,
			});
		});
	}

	scrollDown() {
		document
			.getElementById("after-hero")
			?.scrollIntoView({ behavior: "smooth" });
	}
}
