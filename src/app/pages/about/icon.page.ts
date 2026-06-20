import { Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";

@Component({
	selector: "app-icon-page",
	imports: [MatCardModule],
	template: `
    <div class="icon-page">
      <h1>图标</h1>
      <mat-card appearance="outlined">
        <mat-card-content>
          <p>
            本项目图标来自
            <a href="https://www.pixiv.net/users/66219277" target="_blank" rel="noopener"
              >Yuquanaaa</a
            >
            发表在
            <a href="https://www.pixiv.net/artworks/116666979" target="_blank" rel="noopener"
              >Pixiv</a
            >
            上的作品。
          </p>
          <p>
            此图标由其原作者
            <a href="https://www.pixiv.net/users/66219277" target="_blank" rel="noopener"
              >Yuquanaaa</a
            >
            拥有版权。我们已获得原作者的授权和许可, 可以在本项目中使用这一图标。这一图标不是自由使用的,
            未经原作者明确授权, 任何人不得擅自使用、复制、修改或分发这一图标。
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
	styles: `
    .icon-page {
      max-width: 800px;
      margin: 0 auto;
      padding: 48px 24px;
    }

    h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 32px;
      color: var(--mat-sys-on-surface);
    }

    mat-card {
      border-radius: 16px;
    }

    mat-card-content {
      padding: 8px;
    }

    p {
      font-size: 1rem;
      line-height: 1.6;
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 16px;
    }

    p:last-child {
      margin-bottom: 0;
    }

    a {
      color: var(--mat-sys-primary);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  `,
})
export default class IconPageComponent {}
