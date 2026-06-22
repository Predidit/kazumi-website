import { Injectable, signal } from "@angular/core";
import type { DocSection } from "./docs-nav";

const docNavData = import.meta.glob<{ default: DocSection[] }>(
	"/src/assets/doc-nav.json",
	{ eager: true },
);

@Injectable({ providedIn: "root" })
export class DocNavService {
	private readonly _sections = signal<DocSection[]>([]);
	readonly sections = this._sections.asReadonly();

	constructor() {
		const data = docNavData["/src/assets/doc-nav.json"]?.default;
		if (data) {
			this._sections.set(data);
		}
	}
}
