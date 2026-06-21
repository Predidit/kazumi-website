import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CodeCopyService } from "./features/docs/code-copy.service";
import { HeaderComponent } from "./features/layout/header";

@Component({
	selector: "app-root",
	imports: [RouterOutlet, HeaderComponent],
	template: `
    <app-header />
    <main>
      <router-outlet />
    </main>
  `,
	styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    main {
      flex: 1;
    }
  `,
})
export class App {
	constructor() {
		inject(CodeCopyService);
	}
}
