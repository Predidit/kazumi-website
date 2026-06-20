import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";

@Component({
	selector: "app-hero",
	imports: [RouterLink, MatButtonModule, MatIconModule],
	template: `
    <section class="hero">
      <div class="hero-container">
        <div class="hero-surface">
          <img src="/logo.png" alt="Kazumi" class="hero-logo" />
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
      </div>
    </section>
  `,
	styles: `
    .hero {
      padding: 120px 24px 80px;
      background-color: var(--mat-sys-surface);
    }

    .hero-container {
      max-width: 960px;
      margin: 0 auto;
    }

    .hero-surface {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 64px 48px;
      background-color: var(--mat-sys-surface-container-low);
      border-radius: 28px;
    }

    .hero-logo {
      width: 128px;
      height: 128px;
      border-radius: 28px;
      margin-bottom: 32px;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 12px;
      color: var(--mat-sys-on-surface);
      letter-spacing: -1px;
      line-height: 1.1;
    }

    .hero-tagline {
      font-size: 1.25rem;
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 4px;
      line-height: 1.6;
      max-width: 560px;
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
      justify-content: center;
    }

    .fab-primary {
      --md-fab-container-color: var(--mat-sys-primary);
      --md-fab-icon-color: var(--mat-sys-on-primary);
    }

    .fab-secondary {
      --md-fab-container-color: var(--mat-sys-secondary-container);
      --md-fab-icon-color: var(--mat-sys-on-secondary-container);
    }

    @media (max-width: 768px) {
      .hero {
        padding: 80px 16px 56px;
      }

      .hero-surface {
        padding: 48px 24px;
        border-radius: 24px;
      }

      .hero-logo {
        width: 96px;
        height: 96px;
        border-radius: 24px;
        margin-bottom: 24px;
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .hero-tagline {
        font-size: 1.0625rem;
      }

      .hero-actions {
        flex-direction: column;
        width: 100%;
      }
    }
  `,
})
export class HeroComponent {}
