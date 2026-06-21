import { Injectable, signal } from "@angular/core";

export interface TocItem {
	id: string;
	level: number;
	text: string;
}

@Injectable({ providedIn: "root" })
export class DocsStateService {
	readonly toc = signal<TocItem[]>([]);

	setToc(items: TocItem[]) {
		this.toc.set(items.filter((item) => item.level <= 3));
	}

	clearToc() {
		this.toc.set([]);
	}
}
