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
            <span class="mdi mdi-github"></span>
          </a>
          <a href="https://t.me/kazumi_app" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="Telegram">
            <span class="mdi mdi-telegram"></span>
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

    .social-btn .mdi {
      font-size: 20px;
    }

    .mobile-menu-btn {
      display: none;
    }

    @media (max-width: 768px) {
      .desktop-nav,
      .theme-toggle,
      .nav-divider,
      .social-links {
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
