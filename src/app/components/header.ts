import { Component, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatToolbarModule } from "@angular/material/toolbar";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";

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
      background-color: var(--mat-sys-surface-container);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
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
      background-color: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
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
      background-color: var(--mat-sys-surface-container-high);
    }

    .desktop-nav .nav-trigger .arrow {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-left: auto;
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
	navItems: NavItem[] = [
		{ label: "首页", route: "/", icon: "home" },
		{ label: "文档", route: "/docs", icon: "menu_book" },
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
