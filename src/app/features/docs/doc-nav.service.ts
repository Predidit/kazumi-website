import { Injectable, signal } from "@angular/core";
import type { DocSection } from "./docs-nav";

const docNavData = import.meta.glob<{ default: DocSection[] }>(
	"/doc-nav.json",
	{ eager: true },
);

@Injectable({ providedIn: "root" })
export class DocNavService {
	private readonly _sections = signal<DocSection[]>([]);
	readonly sections = this._sections.asReadonly();

	constructor() {
		const data = docNavData["/doc-nav.json"]?.default;
		if (data) {
			this._sections.set(data);
		}
	}
}
