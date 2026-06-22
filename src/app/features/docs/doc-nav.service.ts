import { Injectable, signal } from "@angular/core";
import { DOC_NAV_DATA } from "./doc-nav-data";
import type { DocSection } from "./docs-nav";

@Injectable({ providedIn: "root" })
export class DocNavService {
	readonly sections = signal<DocSection[]>(DOC_NAV_DATA);
}
