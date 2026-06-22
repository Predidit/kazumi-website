import { isPlatformBrowser } from "@angular/common";
import { Injectable, inject, PLATFORM_ID, signal } from "@angular/core";
import type { DocSection } from "./docs-nav";

@Injectable({ providedIn: "root" })
export class DocNavService {
	private readonly _sections = signal<DocSection[]>([]);
	readonly sections = this._sections.asReadonly();

	constructor() {
		const platformId = inject(PLATFORM_ID);
		if (isPlatformBrowser(platformId)) {
			fetch("/doc-nav.json")
				.then((r) => r.json())
				.then((data: DocSection[]) => this._sections.set(data))
				.catch(() => {});
		}
	}
}
