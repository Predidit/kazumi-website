import { isPlatformBrowser } from "@angular/common";
import { effect, Injectable, inject, PLATFORM_ID, signal } from "@angular/core";

export type ThemeMode = "light" | "dark" | "system";

@Injectable({ providedIn: "root" })
export class ThemeService {
	private readonly platformId = inject(PLATFORM_ID);
	private readonly modeState = signal<ThemeMode>("system");
	readonly mode = this.modeState.asReadonly();

	constructor() {
		if (isPlatformBrowser(this.platformId)) {
			try {
				const saved = localStorage.getItem("theme");
				if (saved === "light" || saved === "dark" || saved === "system")
					this.modeState.set(saved);
			} catch {}

			effect(() => {
				const m = this.mode();
				try {
					localStorage.setItem("theme", m);
				} catch {}
				this.apply(m);
			});
		}
	}

	setMode(mode: ThemeMode) {
		this.modeState.set(mode);
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

		const applied = html.getAttribute("data-theme") ?? "system";
		if (applied === mode) return;
		if (
			"startViewTransition" in document &&
			!window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			const transition = document.startViewTransition(run);
			void transition.ready.catch(() => {});
			void transition.finished.catch(() => {});
		} else {
			run();
		}
	}
}
