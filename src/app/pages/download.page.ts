import {
	afterNextRender,
	Component,
	computed,
	inject,
	signal,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { ActivatedRoute, RouterLink } from "@angular/router";
import {
	detectPlatform,
	getDownloadUrl,
	getReleaseUrl,
	PLATFORMS,
} from "../features/download/platforms";
import { SeoService } from "../features/seo/seo.service";

@Component({
	selector: "app-download",
	imports: [
		MatButtonModule,
		MatIconModule,
		MatProgressBarModule,
		MatSlideToggleModule,
		RouterLink,
	],
	template: `
    <div class="page-shell download-page">
      <header class="download-intro"><h1>下载与安装</h1><p>选择平台，获取安装包与安装指南。</p></header>
      <section aria-labelledby="platform-title" class="download-workspace">
        <div class="platform-picker">
          <h2 id="platform-title">选择操作系统</h2>
          <div class="platform-options" role="group" aria-label="操作系统">
            @for (platform of platforms; track platform.id) {
              <button type="button" (click)="selectedId.set(platform.id)" [class.selected]="selectedId() === platform.id" [attr.aria-pressed]="selectedId() === platform.id">
                <mat-icon>{{ platform.icon }}</mat-icon><span>{{ platform.name }}</span>
                @if (selectedId() === platform.id) { <mat-icon class="selection-check">check_circle</mat-icon> }
              </button>
            }
          </div>
        </div>
        <div class="download-detail" aria-live="polite">
          <div class="detail-top"><span class="platform-emblem"><mat-icon>{{ selected().icon }}</mat-icon></span>
            @if (selected().id === detectedId()) { <span class="version-chip">适合当前设备</span> }
          </div>
          <h2>Kazumi <span>for {{ selected().name }}</span></h2>
          <p class="system-requirement">{{ selected().description }}</p>
          <div class="release-meta">
            @if (loading()) { <span>正在获取发布版本…</span> }
            @else if (selectedTag()) { <span class="status-dot"></span><strong>v{{ selectedTag() }}</strong><span>当前发布版本</span> }
            @else { <mat-icon>info_outline</mat-icon><span>版本信息暂不可用，可前往发布页获取安装包</span> }
          </div>
          @if (loading()) { <mat-progress-bar mode="indeterminate" aria-label="加载版本信息" /> }
          <div class="download-actions">
            @for (link of downloadLinks(); track link.label) {
              @if (link.kind === 'guide') {
                <a mat-stroked-button class="action" [routerLink]="link.url" [fragment]="link.fragment">{{ link.label }}<mat-icon iconPositionEnd>arrow_forward</mat-icon></a>
              } @else if (link.kind === 'asset' && link.primary) {
                <a mat-flat-button class="action action-large" [href]="link.href" target="_blank" rel="noopener noreferrer"><mat-icon>download</mat-icon>{{ selectedTag() ? '下载 ' + link.label : '前往发布页' }}</a>
              } @else {
                <a mat-stroked-button class="action" [href]="link.href" target="_blank" rel="noopener noreferrer">{{ link.label }}<mat-icon iconPositionEnd>north_east</mat-icon></a>
              }
            }
          </div>
          <p class="install-note">{{ selected().installNote }}</p>
          <div class="mirror-setting">
            <div><strong>下载速度较慢？</strong><p>{{ selected().releaseSource === 'ohos' ? '鸿蒙版本使用独立发布源，暂不支持镜像。' : '可以切换镜像。镜像同步可能晚于 GitHub。' }}</p></div>
            <mat-slide-toggle [checked]="useMirror()" [disabled]="selected().releaseSource === 'ohos'" (change)="useMirror.set($event.checked)" aria-label="使用镜像下载"></mat-slide-toggle>
          </div>
          <a class="text-action release-link" [href]="releaseUrl()" target="_blank" rel="noopener noreferrer">更新日志与历史版本 <mat-icon>north_east</mat-icon></a>
          @if (loadError()) { <button mat-button (click)="loadReleases()" [disabled]="loading()">重新获取版本</button> }
        </div>
      </section>
      <section class="install-help" aria-labelledby="install-help-title">
        <div><span class="eyebrow">GET STARTED</span><h2 id="install-help-title">开始使用 Kazumi</h2></div>
        <div class="help-grid">
          <a routerLink="/docs/rules/introduce-rules"><span class="step-number">01</span><div><h3>认识规则</h3><p>了解内容来源，导入你的第一条规则。</p></div><mat-icon>arrow_forward</mat-icon></a>
          <a routerLink="/docs/intro/module-details"><span class="step-number">02</span><div><h3>了解功能</h3><p>认识播放器、弹幕与更多实用功能。</p></div><mat-icon>arrow_forward</mat-icon></a>
          <a routerLink="/docs/misc/qa"><span class="step-number">03</span><div><h3>常见问题</h3><p>查看安装和使用中常见问题的解决方法。</p></div><mat-icon>arrow_forward</mat-icon></a>
        </div>
      </section>
    </div>
  `,
	styles: `
    .download-page { max-width: 1240px; }
    .download-intro { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 8px 24px; padding: 8px 4px 24px; }
    .download-intro h1 { font-size: 28px; font-weight: 650; letter-spacing: -.03em; line-height: 1.4; }
    .download-intro p { font-size: 14px; color: var(--mat-sys-on-surface-variant); line-height: 1.8; }
    @media (max-width: 700px) { .download-intro { flex-direction: column; align-items: flex-start; padding: 8px 8px 20px; } .download-intro h1 { font-size: 24px; } .download-intro p { font-size: 13px; } }
    .download-workspace { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 12px; }
    .platform-picker { min-width: 0; padding: 28px 20px; border-radius: 32px; background: var(--mat-sys-surface-container); }
    .platform-picker h2 { font-size: 14px; font-weight: 600; margin: 0 12px 20px; }
    .platform-options { display: flex; flex-direction: column; gap: 5px; }
    .platform-options button { display: flex; align-items: center; gap: 14px; width: 100%; min-height: 60px; padding: 14px 20px; border: 0; border-radius: 12px; background: transparent; color: var(--mat-sys-on-surface-variant); font-size: 15px; font-weight: 600; text-align: left; transition: border-radius var(--app-motion-spring), background var(--app-motion-fast); }
    .platform-options button:hover { background: var(--mat-sys-surface-container-highest); }
    .platform-options button.selected { border-radius: 32px; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); }
    .platform-options .selection-check { margin-left: auto; width: 18px; height: 18px; font-size: 18px; }
    .download-detail { padding: 40px 44px 24px; background: var(--mat-sys-primary-container); border-radius: 32px; min-width: 0; }
    .detail-top { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
    .platform-emblem { display: grid; place-items: center; width: 76px; height: 76px; border-radius: 26px; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); }
    .platform-emblem mat-icon { width: 36px; height: 36px; font-size: 36px; }
    .version-chip { padding: 7px 12px; border-radius: 20px; font-size: 11px; color: var(--mat-sys-on-primary-container); background: color-mix(in srgb, var(--mat-sys-primary) 10%, transparent); }
    .download-detail h2 { margin: 28px 0 12px; font-size: clamp(28px, 3vw, 40px); font-weight: 800; letter-spacing: -.04em; color: var(--mat-sys-on-primary-container); }
    .download-detail h2 span { font-weight: 450; }
    .system-requirement { font-size: 14px; color: var(--mat-sys-on-primary-container); }
    .release-meta { display: flex; align-items: center; gap: 10px; margin-top: 22px; min-height: 24px; font-size: 12px; color: var(--mat-sys-on-primary-container); }
    .release-meta mat-icon { width: 20px; height: 20px; font-size: 20px; }
    mat-progress-bar { margin-top: 12px; }
    .download-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 26px 0 18px; }
    .install-note { font-size: 12px; line-height: 1.85; color: var(--mat-sys-on-primary-container); min-height: 44px; }
    .mirror-setting { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 22px 0; margin-top: 22px; border-top: 1px solid color-mix(in srgb, var(--mat-sys-primary) 20%, transparent); color: var(--mat-sys-on-primary-container); }
    .mirror-setting strong { font-size: 13px; font-weight: 600; }
    .mirror-setting p { font-size: 11px; margin-top: 4px; }
    .release-link { font-size: 12px; }
    .install-help { margin-top: 64px; }
    .install-help h2 { font-size: 30px; letter-spacing: -.04em; margin: 12px 0 24px; }
    .help-grid { display: grid; gap: 4px; }
    .help-grid a { display: flex; align-items: center; gap: 24px; padding: 24px 28px; background: var(--mat-sys-surface-container-low); border-radius: 8px; color: var(--mat-sys-on-surface); transition: background var(--app-motion-fast); }
    .help-grid a:first-child { border-radius: 28px 28px 8px 8px; }
    .help-grid a:last-child { border-radius: 8px 8px 28px 28px; }
    .help-grid a:hover { background: var(--mat-sys-surface-container-high); }
    .step-number { font-size: 24px; color: var(--mat-sys-primary); font-weight: 500; }
    .help-grid h3 { font-size: 15px; font-weight: 600; }
    .help-grid p { font-size: 13px; color: var(--mat-sys-on-surface-variant); margin-top: 6px; }
    .help-grid mat-icon { margin-left: auto; color: var(--mat-sys-primary); }
    @media (max-width: 850px) { .download-workspace { grid-template-columns: 1fr; } .platform-picker { padding: 20px; } .platform-options { flex-direction: row; flex-wrap: wrap; } .platform-options button { width: auto; min-height: 48px; padding: 12px 16px; font-size: 13px; gap: 8px; } .platform-options .selection-check { display: none; } .platform-picker h2 { margin-left: 4px; margin-bottom: 12px; } }
    @media (max-width: 700px) { .download-detail { padding: 28px 24px 20px; } .platform-picker { padding: 16px; border-radius: 24px; } .platform-options { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--mat-sys-outline-variant) transparent; padding: 4px; } .platform-options button { flex: 0 0 auto; } .platform-emblem { width: 56px; height: 56px; border-radius: 20px; } .download-detail h2 { margin-top: 20px; } .mirror-setting { gap: 12px; } .download-actions { gap: 8px; } .help-grid a { padding: 22px 20px; gap: 16px; } .help-grid p { font-size: 12px; } .install-help { margin-top: 48px; } .install-help h2 { font-size: 26px; } }
  `,
})
export default class DownloadComponent {
	readonly loading = signal(true);
	readonly loadError = signal(false);
	private readonly currentTag = signal("");
	private readonly currentOhosTag = signal("");
	readonly useMirror = signal(false);
	private readonly route = inject(ActivatedRoute);
	private readonly requestedPlatform = PLATFORMS.find(
		(platform) =>
			platform.id === this.route.snapshot.queryParamMap.get("platform"),
	);
	readonly selectedId = signal(this.requestedPlatform?.id ?? "android");
	readonly detectedId = signal("");
	readonly platforms = PLATFORMS;

	readonly selected = computed(
		() =>
			this.platforms.find((p) => p.id === this.selectedId()) ??
			this.platforms[0],
	);
	readonly selectedTag = computed(() =>
		this.selected().releaseSource === "ohos"
			? this.currentOhosTag()
			: this.currentTag(),
	);

	readonly releaseUrl = computed(() => getReleaseUrl(this.selected()));
	readonly downloadLinks = computed(() =>
		this.selected().links.map((link) => ({
			...link,
			href: getDownloadUrl(
				this.selected(),
				link,
				this.selectedTag(),
				this.useMirror(),
			),
		})),
	);

	constructor() {
		inject(SeoService).setDownload();
		afterNextRender(() => {
			const id = detectPlatform(navigator.userAgent, navigator.maxTouchPoints);
			this.detectedId.set(id);
			if (!this.requestedPlatform) this.selectedId.set(id || "android");
			void this.loadReleases();
		});
	}

	async loadReleases(): Promise<void> {
		this.loading.set(true);
		this.loadError.set(false);
		try {
			const response = await fetch("/releases.json", {
				signal: AbortSignal.timeout(10000),
			});
			if (!response.ok) throw new Error("Version request failed");
			const data = await response.json();
			const validTag = (tag: unknown): tag is string =>
				typeof tag === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(tag);
			if (validTag(data.kazumi?.tag)) this.currentTag.set(data.kazumi.tag);
			if (validTag(data.ohos?.tag)) this.currentOhosTag.set(data.ohos.tag);
			if (!validTag(data.kazumi?.tag) || !validTag(data.ohos?.tag))
				this.loadError.set(true);
		} catch {
			this.loadError.set(true);
		} finally {
			this.loading.set(false);
		}
	}
}
