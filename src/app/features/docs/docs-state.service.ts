import { Injectable, signal } from "@angular/core";

export interface TocItem {
	id: string;
	level: number;
	text: string;
}

@Injectable({ providedIn: "root" })
export class DocsStateService {
	private readonly tocState = signal<TocItem[]>([]);
	readonly toc = this.tocState.asReadonly();

	setToc(items: TocItem[]) {
		this.tocState.set(items.filter((item) => item.level <= 3));
	}

	clearToc() {
		this.tocState.set([]);
	}
}
