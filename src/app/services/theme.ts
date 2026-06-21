import { isPlatformBrowser } from "@angular/common";
import { effect, Injectable, inject, PLATFORM_ID, signal } from "@angular/core";

export type ThemeMode = "light" | "dark" | "system";

@Injectable({ providedIn: "root" })
export class ThemeService {
	private platformId = inject(PLATFORM_ID);
	mode = signal<ThemeMode>("system");

	constructor() {
		if (isPlatformBrowser(this.platformId)) {
			const saved = localStorage.getItem("theme") as ThemeMode | null;
			if (saved) this.mode.set(saved);

			effect(() => {
				const m = this.mode();
				localStorage.setItem("theme", m);
				this.apply(m);
			});
		}
	}

	private apply(mode: ThemeMode) {
		const html = document.documentElement;
		const run = () => {
			if (mode === "system") {
				html.removeAttribute("data-theme");
			} else {
				html.setAttribute("data-theme", mode);
			}
		};

		if ("startViewTransition" in document) {
			document.startViewTransition(run);
		} else {
			run();
		}
	}
}
