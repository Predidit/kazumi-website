import { afterNextRender, Component, signal } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";

interface Contributor {
	avatar: string;
	name: string;
	link: string;
}

@Component({
	selector: "app-contributors",
	imports: [MatIconModule],
	template: `
    <section class="contributors" aria-labelledby="contributors-title">
      <div class="section-heading"><div><span class="eyebrow">BUILT BY PEOPLE WHO CARE</span><h2 id="contributors-title">是大家，让故事继续。</h2></div><p>从第一行代码，到每一次改进。<br />谢谢每一个让 Kazumi 更好的人。</p></div>
      <div class="core-team">
        @for (member of coreMembers; track member.name) {
          <a [href]="member.github" target="_blank" rel="noopener noreferrer" class="core-card"><img [src]="member.avatar" [alt]="member.name" width="72" height="72" loading="lazy" /><div><h3>{{ member.name }}</h3><p>{{ member.title }}</p></div><mat-icon>north_east</mat-icon></a>
        }
      </div>
      @if (contributors().length) {
        <div class="contributor-heading"><h3>每一份贡献，都算数。</h3><span>{{ contributors().length }} 位贡献者</span></div>
        <div class="contributors-grid">
          @for (contributor of contributors(); track contributor.name) {
            <a [href]="contributor.link" target="_blank" rel="noopener noreferrer" class="contributor"><img [src]="contributor.avatar" [alt]="contributor.name" width="48" height="48" loading="lazy" /><span>{{ contributor.name }}</span></a>
          }
        </div>
      }
      @if (loading()) { <p class="load-state" role="status">正在认识社区贡献者…</p> }
      @if (failed()) { <p class="load-state" role="status">贡献者列表暂时无法加载。<a href="https://github.com/Predidit/Kazumi/graphs/contributors" target="_blank" rel="noopener noreferrer">在 GitHub 查看所有贡献者</a></p> }
    </section>
  `,
	styles: `
    .section-heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-bottom: 32px; }
    h2 { font-size: clamp(28px, 3vw, 40px); letter-spacing: -.04em; margin-top: 14px; }
    .section-heading > p { font-size: 14px; line-height: 1.9; color: var(--mat-sys-on-surface-variant); }
    .core-team { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .core-card { display: flex; align-items: center; gap: 24px; padding: 32px; border-radius: 28px; background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); transition: border-radius var(--app-motion-spring); }
    .core-card:nth-child(2) { background: var(--app-yellow-container); color: var(--app-on-yellow-container); }
    .core-card:hover { border-radius: 44px 20px 44px 20px; }
    .core-card img { border-radius: 50%; width: 72px; height: 72px; flex-shrink: 0; object-fit: cover; }
    .core-card h3 { font-size: 22px; color: inherit; }
    .core-card p { font-size: 12px; margin-top: 8px; }
    .core-card mat-icon { margin-left: auto; width: 20px; height: 20px; font-size: 20px; }
    .contributor-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin: 40px 0 20px; }
    .contributor-heading h3 { font-size: 17px; font-weight: 600; }
    .contributor-heading > span { font-size: 12px; color: var(--mat-sys-on-surface-variant); }
    .contributors-grid { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 6px; padding: 20px; border-radius: 28px; background: var(--mat-sys-surface-container-low); }
    .contributor { display: flex; align-items: center; flex-direction: column; min-width: 0; gap: 12px; padding: 16px 4px; border-radius: 20px; color: var(--mat-sys-on-surface-variant); }
    .contributor:hover { background: var(--mat-sys-surface-container-high); }
    .contributor img { width: 48px; height: 48px; border-radius: 50%; }
    .contributor span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; }
    .load-state { padding: 24px; color: var(--mat-sys-on-surface-variant); font-size: 13px; }
    @media (max-width: 900px) { .contributors-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
    @media (max-width: 700px) { .section-heading { flex-direction: column; align-items: flex-start; gap: 16px; } .core-team { grid-template-columns: 1fr; gap: 8px; } .core-card { padding: 24px; } .contributors-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); padding: 12px; } }
  `,
})
export class ContributorsComponent {
	readonly coreMembers = [
		{
			avatar: "https://github.com/Predidit.png?size=144",
			name: "Predidit",
			title: "Kazumi 作者与维护者",
			github: "https://github.com/Predidit",
		},
		{
			avatar: "https://github.com/ErBWs.png?size=144",
			name: "ErBW_s",
			title: "鸿蒙版作者与维护者",
			github: "https://github.com/ErBWs",
		},
	];
	readonly contributors = signal<Contributor[]>([]);
	readonly loading = signal(true);
	readonly failed = signal(false);
	constructor() {
		afterNextRender(() => {
			fetch("/contributors.json", { signal: AbortSignal.timeout(10000) })
				.then((response) => {
					if (!response.ok) throw new Error("Contributors unavailable");
					return response.json();
				})
				.then((data: { contributors: Contributor[] }) => {
					if (!Array.isArray(data.contributors))
						throw new Error("Invalid contributors");
					this.contributors.set(data.contributors);
				})
				.catch(() => this.failed.set(true))
				.finally(() => this.loading.set(false));
		});
	}
}
