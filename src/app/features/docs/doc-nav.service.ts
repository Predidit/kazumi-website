import { Injectable, signal } from "@angular/core";
import type { DocSection } from "./docs-nav";

@Injectable({ providedIn: "root" })
export class DocNavService {
	private readonly _sections = signal<DocSection[]>([]);
	readonly sections = this._sections.asReadonly();

	constructor() {
		fetch("/doc-nav.json")
			.then((res) => res.json())
			.then((data: DocSection[]) => this._sections.set(data))
			.catch(() => {});
	}
}
