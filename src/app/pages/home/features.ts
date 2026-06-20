import { Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";

interface Feature {
	icon: string;
	title: string;
	description: string;
}

@Component({
	selector: "app-features",
	imports: [MatIconModule],
	template: `
    <section class="features">
      <div class="features-container">
        <h2 class="section-title">功能特性</h2>
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
      </div>
    </section>
  `,
	styles: `
    .features {
      padding: 80px 24px;
      background-color: var(--mat-sys-surface);
    }

    .features-container {
      max-width: 960px;
      margin: 0 auto;
    }

    .section-title {
      text-align: center;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 56px;
      color: var(--mat-sys-on-surface);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .feature-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 40px 32px;
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
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background-color: var(--mat-sys-primary-container);
      margin-bottom: 20px;
    }

    .icon-wrapper mat-icon {
      color: var(--mat-sys-on-primary-container);
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .feature-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--mat-sys-on-surface);
    }

    .feature-desc {
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
      margin: 0;
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .features {
        padding: 56px 16px;
      }

      .features-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .feature-card {
        padding: 32px 24px;
        flex-direction: row;
        text-align: left;
        gap: 16px;
      }

      .icon-wrapper {
        flex-shrink: 0;
        margin-bottom: 0;
      }

      .section-title {
        margin-bottom: 40px;
      }
    }
  `,
})
export class FeaturesComponent {
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
			description: "基于 MIT 协议开源，免费无广告",
		},
	];
}
