import { isPlatformBrowser } from "@angular/common";
import {
	afterNextRender,
	Injectable,
	inject,
	PLATFORM_ID,
} from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class CodeCopyService {
	private platformId = inject(PLATFORM_ID);
	private router = inject(Router);

	constructor() {
		if (!isPlatformBrowser(this.platformId)) return;

		afterNextRender(() => this.addButtons());

		this.router.events
			.pipe(filter((e) => e instanceof NavigationEnd))
			.subscribe(() => setTimeout(() => this.addButtons(), 100));
	}

	private addButtons() {
		const pres = document.querySelectorAll(
			".analog-markdown-route pre, .analog-markdown pre",
		);

		for (const pre of pres) {
			if (pre.querySelector(".copy-btn")) continue;

			const btn = document.createElement("button");
			btn.className = "copy-btn";
			btn.innerHTML = '<span class="mdi mdi-content-copy"></span>';
			btn.setAttribute("aria-label", "复制代码");

			btn.addEventListener("click", () => {
				const code = pre.querySelector("code");
				if (!code) return;

				navigator.clipboard.writeText(code.textContent || "").then(() => {
					btn.innerHTML = '<span class="mdi mdi-check"></span>';
					btn.classList.add("copied");
					setTimeout(() => {
						btn.innerHTML = '<span class="mdi mdi-content-copy"></span>';
						btn.classList.remove("copied");
					}, 2000);
				});
			});

			(pre as HTMLElement).style.position = "relative";
			pre.appendChild(btn);
		}
	}
}
