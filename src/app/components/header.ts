import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ThemeMode, ThemeService } from "../services/theme";

interface NavItem {
	label: string;
	route?: string;
	icon?: string;
	children?: { label: string; route: string; icon?: string }[];
}

@Component({
	selector: "app-header",
	imports: [
		RouterLink,
		RouterLinkActive,
		MatToolbarModule,
		MatIconModule,
		MatButtonModule,
		MatMenuModule,
	],
	template: `
    <header class="header">
      <div class="header-inner">
        <a routerLink="/" class="logo">
          <img src="/logo.png" alt="Kazumi" class="logo-img" />
          <span class="logo-text">Kazumi</span>
        </a>

        <span class="spacer"></span>

        <nav class="desktop-nav">
          @for (item of navItems; track item.label) {
            @if (item.children) {
              <button
                [matMenuTriggerFor]="groupMenu"
                class="nav-trigger"
              >
                @if (item.icon) {
                  <mat-icon>{{ item.icon }}</mat-icon>
                }
                {{ item.label }}
                <mat-icon class="arrow">arrow_drop_down</mat-icon>
              </button>
              <mat-menu #groupMenu="matMenu">
                @for (child of item.children; track child.route) {
                  @if (child.route.startsWith('http')) {
                    <a mat-menu-item [href]="child.route" target="_blank" rel="noopener">
                      @if (child.icon) {
                        <mat-icon>{{ child.icon }}</mat-icon>
                      }
                      {{ child.label }}
                    </a>
                  } @else {
                    <a mat-menu-item [routerLink]="child.route">
                      @if (child.icon) {
                        <mat-icon>{{ child.icon }}</mat-icon>
                      }
                      {{ child.label }}
                    </a>
                  }
                }
              </mat-menu>
            } @else {
              <a
                mat-button
                [routerLink]="item.route"
                routerLinkActive="active-link"
                [routerLinkActiveOptions]="{ exact: item.route === '/' }"
              >
                @if (item.icon) {
                  <mat-icon>{{ item.icon }}</mat-icon>
                }
                {{ item.label }}
              </a>
            }
          }
        </nav>

        <span class="nav-divider"></span>

        <div class="theme-toggle">
            @for (opt of themeOptions; track opt.value) {
              <button
                class="theme-btn"
                [class.active]="theme.mode() === opt.value"
                (click)="theme.mode.set(opt.value)"
                [attr.aria-label]="opt.label"
              >
                <mat-icon>{{ opt.icon }}</mat-icon>
              </button>
            }
          </div>

        <span class="nav-divider"></span>

        <div class="social-links">
          <a href="https://github.com/Predidit/Kazumi" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="GitHub">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
          </a>
          <a href="https://t.me/kazumi_app" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="Telegram">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.504-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.013-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          </a>
        </div>

        <button
          mat-icon-button
          [matMenuTriggerFor]="mobileMenu"
          class="mobile-menu-btn"
          aria-label="导航菜单"
        >
          <mat-icon>menu</mat-icon>
        </button>
      </div>
    </header>

    <mat-menu #mobileMenu="matMenu">
      @for (item of navItems; track item.label) {
        @if (item.children) {
          <button mat-menu-item [matMenuTriggerFor]="subMenu">
            @if (item.icon) {
              <mat-icon>{{ item.icon }}</mat-icon>
            }
            {{ item.label }}
          </button>
          <mat-menu #subMenu="matMenu">
            @for (child of item.children; track child.route) {
              @if (child.route.startsWith('http')) {
                <a mat-menu-item [href]="child.route" target="_blank" rel="noopener">
                  @if (child.icon) {
                    <mat-icon>{{ child.icon }}</mat-icon>
                  }
                  {{ child.label }}
                </a>
              } @else {
                <a mat-menu-item [routerLink]="child.route">
                  @if (child.icon) {
                    <mat-icon>{{ child.icon }}</mat-icon>
                  }
                  {{ child.label }}
                </a>
              }
            }
          </mat-menu>
        } @else {
          <a mat-menu-item [routerLink]="item.route">
            @if (item.icon) {
              <mat-icon>{{ item.icon }}</mat-icon>
            }
            {{ item.label }}
          </a>
        }
      }
      <a mat-menu-item href="https://github.com/Predidit/Kazumi" target="_blank" rel="noopener noreferrer">
        GitHub
      </a>
      <a mat-menu-item href="https://t.me/kazumi_app" target="_blank" rel="noopener noreferrer">
        Telegram
      </a>
    </mat-menu>
  `,
	styles: `
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .header {
      background-color: var(--mat-sys-surface);
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      height: 64px;
    }

    .header-inner {
      display: flex;
      align-items: center;
      padding: 0 24px;
      height: 100%;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--mat-sys-on-surface);
    }

    .logo-img {
      width: 36px;
      height: 36px;
      border-radius: 12px;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .spacer {
      flex: 1;
    }

    .desktop-nav {
      display: flex;
      gap: 4px;
    }

    .desktop-nav a {
      color: var(--mat-sys-on-surface-variant);
      font-weight: 500;
      font-size: 0.875rem;
      border-radius: 20px;
      padding: 0 16px;
      height: 40px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .desktop-nav a.active-link {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }

    .desktop-nav a mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .desktop-nav .nav-trigger {
      color: var(--mat-sys-on-surface-variant);
      font-weight: 500;
      font-size: 0.875rem;
      border-radius: 20px;
      padding: 0 12px 0 16px;
      height: 40px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: none;
      background: none;
      cursor: pointer;
      font-family: inherit;
      transition: background-color 0.2s;
    }

    .desktop-nav .nav-trigger:hover {
      background-color: color-mix(in srgb, var(--mat-sys-on-surface) 4%, transparent);
    }

    .desktop-nav .nav-trigger .arrow {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-left: auto;
    }

    .nav-divider {
      width: 1px;
      height: 24px;
      background-color: var(--mat-sys-outline-variant);
      margin: 0 8px;
    }

    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 2px;
      margin-left: 8px;
      padding: 4px;
      border-radius: 20px;
      background-color: var(--mat-sys-surface-container);
    }

    .theme-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 16px;
      background: none;
      color: var(--mat-sys-on-surface-variant);
      cursor: pointer;
      transition: background-color 0.2s, color 0.2s;
    }

    .theme-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .theme-btn:hover {
      background-color: color-mix(in srgb, var(--mat-sys-on-surface) 4%, transparent);
    }

    .theme-btn.active {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }

    .social-links {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .social-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 20px;
      color: var(--mat-sys-on-surface-variant);
      text-decoration: none;
      transition: background-color 0.2s;
    }

    .social-btn:hover {
      background-color: color-mix(in srgb, var(--mat-sys-on-surface) 4%, transparent);
    }

    .social-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .social-btn svg {
      flex-shrink: 0;
    }

    .mobile-menu-btn {
      display: none;
    }

    @media (max-width: 768px) {
      .desktop-nav {
        display: none;
      }

      .mobile-menu-btn {
        display: inline-flex;
      }

      .header-inner {
        padding: 0 16px;
      }
    }
  `,
})
export class HeaderComponent {
	theme = inject(ThemeService);

	themeOptions = [
		{ value: "light" as ThemeMode, icon: "light_mode", label: "浅色" },
		{ value: "dark" as ThemeMode, icon: "dark_mode", label: "深色" },
		{
			value: "system" as ThemeMode,
			icon: "brightness_auto",
			label: "跟随系统",
		},
	];

	navItems: NavItem[] = [
		{ label: "首页", route: "/", icon: "home" },
		{ label: "文档", route: "/docs/intro/what-is-kazumi", icon: "menu_book" },
		{ label: "下载", route: "/download", icon: "download" },
		{
			label: "关于",
			icon: "info",
			children: [
				{ label: "图标来源", route: "/about/icon", icon: "palette" },
				{
					label: "Issues",
					route: "https://github.com/Predidit/Kazumi/issues",
					icon: "bug_report",
				},
				{
					label: "参与贡献",
					route:
						"https://github.com/Predidit/Kazumi/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22",
					icon: "group",
				},
			],
		},
	];
}
