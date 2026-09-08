import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ThemeMode, ThemeService } from "./theme.service";

@Component({
	selector: "app-header",
	imports: [
		RouterLink,
		RouterLinkActive,
		MatButtonModule,
		MatIconModule,
		MatMenuModule,
	],
	template: `
    <header class="site-header">
      <a class="brand" routerLink="/" aria-label="Kazumi 首页">
        <span>Kazumi<span class="brand-dot">.</span></span>
      </a>
      <nav class="main-nav" aria-label="主导航">
        @for (item of navigation; track item.route) {
          <a [routerLink]="item.route" routerLinkActive="selected" [routerLinkActiveOptions]="{ exact: item.route === '/' }" ariaCurrentWhenActive="page">
            <span class="nav-icon"><mat-icon>{{ item.icon }}</mat-icon></span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
      <div class="header-actions">
        <button mat-icon-button [matMenuTriggerFor]="themeMenu" aria-label="切换外观主题" class="theme-button">
          <mat-icon>{{ theme.mode() === 'system' ? 'contrast' : theme.mode() === 'dark' ? 'dark_mode' : 'light_mode' }}</mat-icon>
        </button>
        <mat-menu #themeMenu="matMenu">
          @for (option of themeOptions; track option.value) {
            <button mat-menu-item (click)="theme.setMode(option.value)" [attr.aria-label]="option.label + (theme.mode() === option.value ? '，已选择' : '')">
              <mat-icon>{{ theme.mode() === option.value ? 'check' : option.icon }}</mat-icon>
              <span>{{ option.label }}</span>
            </button>
          }
        </mat-menu>
        <a class="source-link" href="https://github.com/Predidit/Kazumi" target="_blank" rel="noopener noreferrer" aria-label="在 GitHub 查看源代码（新窗口）">
          <span class="mdi mdi-github" aria-hidden="true"></span><span>GitHub</span><mat-icon>north_east</mat-icon>
        </a>
      </div>
    </header>
  `,
	styles: `
    :host { display: block; position: sticky; top: 0; z-index: 100; background: var(--mat-sys-surface); }
    .site-header { max-width: 1440px; height: var(--app-header-height); margin: auto; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
    .brand { display: flex; align-items: center; gap: 10px; color: var(--mat-sys-on-surface); font-family: var(--app-display-font); font-size: 28px; font-weight: 800; letter-spacing: -1.4px; }
    .brand-dot { color: var(--mat-sys-primary); }
    .main-nav { display: flex; align-items: center; padding: 5px; gap: 4px; border-radius: 32px; background: var(--mat-sys-surface-container); }
    .main-nav a { display: flex; align-items: center; justify-content: center; gap: 7px; min-height: 46px; padding: 0 21px; border-radius: 26px; color: var(--mat-sys-on-surface-variant); font-size: 14px; font-weight: 600; transition: background var(--app-motion-fast), border-radius var(--app-motion-spring); }
    .nav-icon { display: flex; align-items: center; justify-content: center; }
    .nav-icon mat-icon { width: 20px; height: 20px; font-size: 20px; }
    .main-nav a:hover { background: var(--mat-sys-surface-container-high); }
    .main-nav a.selected { background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); }
    .main-nav a:active { border-radius: 12px; }
    .header-actions { display: flex; align-items: center; gap: 14px; }
    .theme-button { background: var(--mat-sys-surface-container); }
    .source-link { display: flex; align-items: center; gap: 8px; min-height: 48px; color: var(--mat-sys-on-surface); font-size: 13px; font-weight: 600; }
    .source-link .mdi { font-size: 22px; }
    .source-link mat-icon { font-size: 16px; width: 16px; height: 16px; }
    @media (max-width: 1000px) { .site-header { padding: 0 24px; } .main-nav a { padding: 0 15px; } .source-link span:not(.mdi), .source-link mat-icon { display: none; } }
    @media (max-width: 700px) {
      .site-header { padding: 0 20px; }
      .brand { font-size: 26px; }
      .main-nav { position: fixed; bottom: 0; left: 0; right: 0; border-radius: 24px 24px 0 0; padding: 8px 12px calc(8px + env(safe-area-inset-bottom)); justify-content: space-around; background: var(--mat-sys-surface-container); box-shadow: 0 -1px 0 var(--mat-sys-outline-variant); }
      .main-nav a { flex: 1; flex-direction: column; gap: 3px; padding: 0; min-height: 58px; font-size: 11px; border-radius: 16px; }
      .main-nav a.selected { color: var(--mat-sys-on-surface); background: transparent; }
      .nav-icon { width: 60px; height: 30px; border-radius: 20px; }
      .main-nav a.selected .nav-icon { color: var(--mat-sys-on-primary); background: var(--mat-sys-primary); }
      .header-actions { gap: 10px; }
      .source-link { width: 32px; justify-content: center; }
    }
  `,
})
export class HeaderComponent {
	readonly theme = inject(ThemeService);
	readonly navigation = [
		{ route: "/", label: "发现", icon: "explore" },
		{ route: "/download", label: "下载", icon: "download" },
		{ route: "/docs", label: "指南", icon: "auto_stories" },
		{ route: "/about", label: "共创", icon: "favorite_border" },
	];
	readonly themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
		{ value: "light", label: "浅色", icon: "light_mode" },
		{ value: "dark", label: "深色", icon: "dark_mode" },
		{ value: "system", label: "跟随系统", icon: "contrast" },
	];
}
