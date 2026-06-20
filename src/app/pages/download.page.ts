import { isPlatformBrowser } from "@angular/common";
import {
	afterNextRender,
	Component,
	inject,
	PLATFORM_ID,
	signal,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";

interface PlatformLink {
	label: string;
	url: string;
	external?: boolean;
	primary?: boolean;
}

interface Platform {
	id: string;
	name: string;
	description: string;
	repo?: string;
	useOhosTag?: boolean;
	links: PlatformLink[];
}

@Component({
	selector: "app-download",
	imports: [
		MatCardModule,
		MatSlideToggleModule,
		MatIconModule,
		MatProgressBarModule,
		MatButtonModule,
	],
	template: `
    <div class="download-page">
      <h1>下载 Kazumi</h1>
      <p class="subtitle">选择适合您操作系统的版本下载</p>

      @if (loading()) {
        <mat-card appearance="outlined">
          <mat-card-content class="loading-content">
            <mat-progress-bar mode="indeterminate" />
            <p>正在获取版本信息...</p>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card appearance="outlined">
          <mat-card-content>
            <div class="mirror-switch">
              <mat-slide-toggle [checked]="useMirror()" (change)="useMirror.set($event.checked)">
                使用镜像下载（OHOS 不可用，镜像可能不是最新版本）
              </mat-slide-toggle>
            </div>

            <div class="platforms">
              @for (platform of platforms; track platform.id) {
                <div class="platform-item">
                  <div class="platform-info">
                    <mat-icon class="platform-icon">{{ getIcon(platform.id) }}</mat-icon>
                    <div>
                      <h3>{{ platform.name }}</h3>
                      <p>{{ platform.description }}</p>
                      @if (platform.id === 'ohos' && currentOhosTag()) {
                        <p class="tag">鸿蒙版本: {{ currentOhosTag() }}</p>
                      }
                    </div>
                  </div>
                  <div class="links">
                    @for (link of platform.links; track link.label) {
                      @if (link.primary) {
                        <a
                          mat-flat-button
                          [href]="getDownloadUrl(platform, link)"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {{ link.label }}
                        </a>
                      } @else {
                        <a
                          mat-stroked-button
                          [href]="getDownloadUrl(platform, link)"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {{ link.label }}
                        </a>
                      }
                    }
                  </div>
                </div>
              }
            </div>

            <div class="version-info">
              <div>
                <strong>主仓库版本:</strong> {{ currentTag() }}
                @if (currentOhosTag()) {
                  <span class="ohos-tag">
                    <strong>鸿蒙分支版本:</strong> {{ currentOhosTag() }}
                  </span>
                }
              </div>
              <a
                mat-button
                color="primary"
                [href]="githubUrl"
                target="_blank"
              >
                查看所有版本 →
              </a>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
	styles: `
    .download-page {
      max-width: 900px;
      margin: 0 auto;
      padding: 48px 24px;
    }

    h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--mat-sys-on-surface);
    }

    .subtitle {
      font-size: 1rem;
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 32px;
    }

    mat-card {
      border-radius: 28px;
      background: var(--mat-sys-surface-container-low);
      border: none;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 32px;
      text-align: center;
    }

    .loading-content p {
      color: var(--mat-sys-on-surface-variant);
    }

    .mirror-switch {
      margin-bottom: 24px;
      padding: 16px 20px;
      background: var(--mat-sys-surface-container);
      border-radius: 16px;
    }

    .platforms {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .platform-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: var(--mat-sys-surface-container);
      border-radius: 16px;
      transition: background-color 0.2s;
    }

    .platform-item:hover {
      background: color-mix(in srgb, var(--mat-sys-on-surface) 4%, transparent);
    }

    .platform-info {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }

    .platform-icon {
      font-size: 24px;
      width: 48px;
      height: 48px;
      min-width: 48px;
      color: var(--mat-sys-primary);
      background: var(--mat-sys-primary-container);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .platform-info h3 {
      margin: 0 0 4px;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
    }

    .platform-info p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .tag {
      margin-top: 4px !important;
      font-size: 0.75rem !important;
      color: var(--mat-sys-on-surface-variant) !important;
      font-style: italic;
    }

    .links {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .version-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid var(--mat-sys-outline-variant);
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .ohos-tag {
      margin-left: 16px;
    }

    @media (max-width: 768px) {
      .platform-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .links {
        width: 100%;
        justify-content: flex-start;
      }

      .version-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }

    @media (max-width: 480px) {
      .download-page {
        padding: 24px 16px;
      }

      .platform-item {
        padding: 16px;
      }

      .links {
        flex-direction: column;
        width: 100%;
      }

      .links a {
        width: 100%;
        text-align: center;
      }
    }
  `,
})
export default class DownloadComponent {
	loading = signal(true);
	currentTag = signal("tag");
	currentOhosTag = signal("");
	useMirror = signal(false);

	githubUrl = "https://github.com/Predidit/Kazumi/releases";

	platforms: Platform[] = [
		{
			id: "android",
			name: "Android",
			description: "适用于 Android 10 及以上",
			links: [
				{ label: "APK", url: "Kazumi_android_{tag}.apk", primary: true },
				{
					label: "F-Droid",
					url: "https://f-droid.org/packages/com.predidit.kazumi",
					external: true,
				},
			],
		},
		{
			id: "ios",
			name: "iOS",
			description: "适用于 iOS/iPadOS 13 及以上",
			links: [
				{ label: "IPA", url: "Kazumi_ios_{tag}_no_sign.ipa", primary: true },
				{
					label: "安装文档",
					url: "/docs/misc/how-to-install-in-ios",
					external: true,
				},
			],
		},
		{
			id: "windows",
			name: "Windows",
			description: "适用于 Windows 10 及以上",
			links: [
				{ label: "MSIX", url: "Kazumi_windows_{tag}.msix", primary: true },
				{ label: "便携版", url: "Kazumi_windows_{tag}.zip" },
			],
		},
		{
			id: "mac",
			name: "macOS",
			description: "适用于 MacOS 10.15 及以上",
			links: [{ label: "DMG", url: "Kazumi_macos_{tag}.dmg", primary: true }],
		},
		{
			id: "linux",
			name: "Linux",
			description: "实验性支持",
			links: [
				{ label: "DEB", url: "Kazumi_linux_{tag}_amd64.deb", primary: true },
				{ label: "便携版", url: "Kazumi_linux_{tag}_amd64.tar.gz" },
				{
					label: "Flathub",
					url: "https://flathub.org/en/apps/io.github.Predidit.Kazumi",
					external: true,
				},
			],
		},
		{
			id: "ohos",
			name: "OHOS",
			description: "适用于 HarmonyOS NEXT",
			repo: "ErBWs/Kazumi",
			useOhosTag: true,
			links: [
				{ label: "HAP", url: "Kazumi_ohos_{tag}_unsigned.hap", primary: true },
				{
					label: "安装文档",
					url: "/docs/misc/how-to-install-in-ohos",
					external: true,
				},
			],
		},
		{
			id: "arch",
			name: "Arch Linux",
			description: "实验性支持",
			links: [
				{
					label: "下载文档",
					url: "/docs/intro/how-to-download#arch-linux",
					external: true,
				},
			],
		},
	];

	private platformId = inject(PLATFORM_ID);

	constructor() {
		afterNextRender(() => {
			if (isPlatformBrowser(this.platformId)) {
				this.loadReleases();
			} else {
				this.loading.set(false);
			}
		});
	}

	getIcon(id: string): string {
		const icons: Record<string, string> = {
			android: "android",
			ios: "phone_iphone",
			windows: "desktop_windows",
			mac: "laptop_mac",
			linux: "computer",
			ohos: "phone_android",
			arch: "terminal",
		};
		return icons[id] || "download";
	}

	getDownloadUrl(platform: Platform, link: PlatformLink): string {
		if (link.external) return link.url;

		const tag = platform.useOhosTag ? this.currentOhosTag() : this.currentTag();
		const repo = platform.repo || "Predidit/Kazumi";

		const baseUrl =
			this.useMirror() && !platform.useOhosTag && repo === "Predidit/Kazumi"
				? "https://atomgit.com/gh_mirrors/ka/Kazumi/releases/download"
				: `https://github.com/${repo}/releases/download`;

		return `${baseUrl}/${tag}/${link.url.replace("{tag}", tag)}`;
	}

	async loadReleases(): Promise<void> {
		try {
			const response = await fetch("/releases.json");
			if (!response.ok) throw new Error(`HTTP ${response.status}`);

			const data = await response.json();
			if (data.kazumi?.tag) this.currentTag.set(data.kazumi.tag);
			if (data.ohos?.tag) this.currentOhosTag.set(data.ohos.tag);
		} catch (err) {
			console.error("Failed to load releases:", err);
		} finally {
			this.loading.set(false);
		}
	}
}
