import { isPlatformBrowser } from "@angular/common";
import {
	afterNextRender,
	Component,
	inject,
	PLATFORM_ID,
	signal,
} from "@angular/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

interface Contributor {
	avatar: string;
	name: string;
	link: string;
}

interface CoreMember {
	avatar: string;
	name: string;
	title: string;
	github: string;
}

interface ContributorsData {
	contributors: Contributor[];
}

@Component({
	selector: "app-contributors",
	imports: [MatProgressSpinnerModule],
	template: `
    <section class="contributors">
      <div class="contributors-container">
        <h2 class="section-title">Kazumi 开发自 ❤</h2>
        <div class="core-team">
          @for (member of coreMembers; track member.name) {
            <a [href]="member.github" target="_blank" rel="noopener noreferrer" class="core-card">
              <img [src]="member.avatar" [alt]="member.name" class="core-avatar" />
              <span class="core-name">{{ member.name }}</span>
              <span class="core-title">{{ member.title }}</span>
            </a>
          }
        </div>

        @if (contributors().length > 0) {
          <h2 class="section-title">感谢以下贡献者</h2>
          <div class="contributors-card">
            <div class="contributors-grid">
              @for (c of contributors(); track c.name) {
                <a
                  [href]="c.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="contributor-item"
                >
                  <img [src]="c.avatar + '?size=80'" [alt]="c.name" class="contributor-avatar" />
                  <span class="contributor-name">{{ c.name }}</span>
                </a>
              }
            </div>
          </div>
        }

        @if (loading()) {
          <div class="loading">
            <mat-spinner diameter="32"></mat-spinner>
          </div>
        }
      </div>
    </section>
  `,
	styles: `
    .contributors {
      padding: 80px 24px;
      background-color: var(--mat-sys-surface);
    }

    .contributors-container {
      max-width: 960px;
      margin: 0 auto;
    }

    .section-title {
      text-align: center;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 40px;
      color: var(--mat-sys-on-surface);
    }

    .section-title:not(:first-child) {
      margin-top: 64px;
    }

    .core-team {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      max-width: 480px;
      margin: 0 auto;
    }

    .core-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 24px;
      border-radius: 16px;
      background-color: var(--mat-sys-surface-container-low);
      text-decoration: none;
      color: inherit;
      transition: background-color 0.2s;
    }

    .core-card:hover {
      background-color: color-mix(in srgb, var(--mat-sys-on-surface) 4%, transparent);
    }

    .core-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      margin-bottom: 16px;
    }

    .core-name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
    }

    .core-title {
      font-size: 0.8125rem;
      color: var(--mat-sys-on-surface-variant);
      margin-top: 4px;
    }

    .contributors-card {
      background-color: var(--mat-sys-surface-container-low);
      border-radius: 28px;
      padding: 32px;
    }

    .contributors-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 12px;
    }

    .contributor-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 4px;
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
      transition: background-color 0.2s;
    }

    .contributor-item:hover {
      background-color: color-mix(in srgb, var(--mat-sys-on-surface) 4%, transparent);
    }

    .contributor-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-bottom: 8px;
    }

    .contributor-name {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--mat-sys-on-surface-variant);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      text-align: center;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 32px;
    }

    @media (max-width: 768px) {
      .contributors {
        padding: 56px 16px;
      }

      .core-team {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .contributors-card {
        padding: 24px 16px;
        border-radius: 24px;
      }

      .contributors-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }

      .section-title:not(:first-child) {
        margin-top: 48px;
      }
    }

    @media (max-width: 480px) {
      .contributors-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `,
})
export class ContributorsComponent {
	private platformId = inject(PLATFORM_ID);

	coreMembers: CoreMember[] = [
		{
			avatar: "https://github.com/Predidit.png?size=80",
			name: "Predidit",
			title: "作者",
			github: "https://github.com/Predidit",
		},
		{
			avatar: "https://github.com/ErBWs.png?size=80",
			name: "ErBW_s",
			title: "鸿蒙版作者",
			github: "https://github.com/ErBWs",
		},
	];

	contributors = signal<Contributor[]>([]);
	loading = signal(true);

	constructor() {
		afterNextRender(() => {
			if (!isPlatformBrowser(this.platformId)) {
				this.loading.set(false);
				return;
			}
			fetch("/contributors.json")
				.then((res) => res.json())
				.then((data: ContributorsData) => {
					this.contributors.set(data.contributors);
					this.loading.set(false);
				})
				.catch(() => {
					this.loading.set(false);
				});
		});
	}
}
