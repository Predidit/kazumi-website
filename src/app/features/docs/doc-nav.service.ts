import { isPlatformBrowser } from "@angular/common";
import { Injectable, inject, PLATFORM_ID, signal } from "@angular/core";
import type { DocSection } from "./docs-nav";

@Injectable({ providedIn: "root" })
export class DocNavService {
	private readonly _sections = signal<DocSection[]>([]);
	readonly sections = this._sections.asReadonly();

	constructor() {
		if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
		fetch("/doc-nav.json")
			.then((res) => res.json())
			.then((data: DocSection[]) => this._sections.set(data))
			.catch((err) => console.warn("Failed to load doc-nav.json", err));
	}
}
