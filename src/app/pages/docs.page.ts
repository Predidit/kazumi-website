import { Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatSidenavModule } from "@angular/material/sidenav";
import { RouterModule, RouterOutlet } from "@angular/router";
import { DocFooterComponent } from "../features/docs/doc-footer";
import { TocComponent } from "../features/docs/toc";

@Component({
	selector: "app-docs",
	standalone: true,
	imports: [
		RouterOutlet,
		MatSidenavModule,
		MatListModule,
		MatIconModule,
		RouterModule,
		TocComponent,
		DocFooterComponent,
	],
	template: `
    <mat-sidenav-container class="docs-container">
      <mat-sidenav mode="side" opened class="docs-sidebar">
        <nav class="sidebar-nav">
          <div class="sidebar-section">
            <h4 class="section-title">简介</h4>
            <a class="sidebar-link" routerLink="/docs/intro/what-is-kazumi" href="/docs/intro/what-is-kazumi" routerLinkActive="active-link">
              <mat-icon>info</mat-icon>
              <span>Kazumi 是什么？</span>
            </a>
            <a class="sidebar-link" routerLink="/docs/intro/how-to-download" href="/docs/intro/how-to-download" routerLinkActive="active-link">
              <mat-icon>download</mat-icon>
              <span>如何下载</span>
            </a>
            <a class="sidebar-link" routerLink="/docs/intro/screenshots" href="/docs/intro/screenshots" routerLinkActive="active-link">
              <mat-icon>photo_library</mat-icon>
              <span>软件界面</span>
            </a>
            <a class="sidebar-link" routerLink="/docs/intro/module-details" href="/docs/intro/module-details" routerLinkActive="active-link">
              <mat-icon>widgets</mat-icon>
              <span>功能模块</span>
            </a>
          </div>

          <div class="sidebar-section">
            <h4 class="section-title">规则指南</h4>
            <a class="sidebar-link" routerLink="/docs/rules/introduce-rules" href="/docs/rules/introduce-rules" routerLinkActive="active-link">
              <mat-icon>description</mat-icon>
              <span>规则介绍</span>
            </a>
            <a class="sidebar-link" routerLink="/docs/rules/develop-rules" href="/docs/rules/develop-rules" routerLinkActive="active-link">
              <mat-icon>code</mat-icon>
              <span>规则开发</span>
            </a>
            <a class="sidebar-link" routerLink="/docs/rules/develop-rules-example" href="/docs/rules/develop-rules-example" routerLinkActive="active-link">
              <mat-icon>snippet_folder</mat-icon>
              <span>规则示例</span>
            </a>
          </div>

          <div class="sidebar-section">
            <h4 class="section-title">架构</h4>
            <a class="sidebar-link" routerLink="/docs/architecture/video-parser" href="/docs/architecture/video-parser" routerLinkActive="active-link">
              <mat-icon>video_library</mat-icon>
              <span>视频嗅探</span>
            </a>
            <a class="sidebar-link" routerLink="/docs/architecture/bbcode" href="/docs/architecture/bbcode" routerLinkActive="active-link">
              <mat-icon>text_fields</mat-icon>
              <span>BBCode 解析</span>
            </a>
          </div>

          <div class="sidebar-section">
            <h4 class="section-title">其他</h4>
            <a class="sidebar-link" routerLink="/docs/misc/qa" href="/docs/misc/qa" routerLinkActive="active-link">
              <mat-icon>help</mat-icon>
              <span>常见问题</span>
            </a>
            <a class="sidebar-link" routerLink="/docs/misc/how-to-install-in-ios" href="/docs/misc/how-to-install-in-ios" routerLinkActive="active-link">
              <mat-icon>phone_iphone</mat-icon>
              <span>iOS 自签</span>
            </a>
            <a class="sidebar-link" routerLink="/docs/misc/how-to-install-in-ohos" href="/docs/misc/how-to-install-in-ohos" routerLinkActive="active-link">
              <mat-icon>phone_android</mat-icon>
              <span>OHOS 侧载</span>
            </a>
          </div>
        </nav>
      </mat-sidenav>

      <mat-sidenav-content class="docs-content">
        <div class="content-layout">
          <div class="content-main">
            <router-outlet />
            <app-doc-footer />
          </div>
          <aside class="content-toc">
            <app-toc />
          </aside>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
	styles: [
		`
    .docs-container {
      height: calc(100vh - 64px);
    }

    .docs-sidebar {
      width: 260px;
      background: var(--mat-sys-surface-container-low);
      border-right: none;
      border-radius: 0;
      padding: 16px 12px;
      overflow-y: auto;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .sidebar-section {
      margin-bottom: 8px;
    }

    .section-title {
      padding: 12px 16px 6px;
      margin: 0;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
      height: 40px;
      border-radius: 20px;
      text-decoration: none;
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem;
      font-weight: 500;
      transition: background-color 0.15s ease;
    }

    .sidebar-link:hover {
      background-color: color-mix(in srgb, var(--mat-sys-on-surface) 4%, transparent);
    }

    .sidebar-link mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--mat-sys-on-surface-variant);
    }

    .sidebar-link.active-link {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      font-weight: 600;
    }

    .sidebar-link.active-link mat-icon {
      color: var(--mat-sys-on-primary-container);
    }

    .docs-content {
      padding: 0 24px;
      background: var(--mat-sys-surface);
      overflow-y: auto;
    }

    .content-layout {
      display: flex;
      gap: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .content-main {
      flex: 1;
      min-width: 0;
    }

    .content-toc {
      width: 220px;
      flex-shrink: 0;
    }

    @media (max-width: 1100px) {
      .content-toc {
        display: none;
      }
    }

    :host {
      display: block;
    }
  `,
	],
})
export default class DocsComponent {}
