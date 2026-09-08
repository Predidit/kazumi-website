import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "./features/layout/footer";
import { HeaderComponent } from "./features/layout/header";

@Component({
	selector: "app-root",
	imports: [RouterOutlet, HeaderComponent, FooterComponent],
	template: `
    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <app-header />
    <main id="main-content" tabindex="-1">
      <router-outlet />
    </main>
    <app-footer />
  `,
	styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    main {
      flex: 1;
      min-width: 0;
      outline: none;
    }
  `,
})
export class App {}
