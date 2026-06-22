import {
	Component,
	computed,
	effect,
	inject,
	input,
	signal,
} from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import Prism from "prismjs";

const LANG_MODULES = import.meta.glob<unknown>(
	"/node_modules/prismjs/components/prism-*.js",
);
const loadedLangs = new Set<string>();

async function ensureLang(lang: string): Promise<boolean> {
	if (!lang || loadedLangs.has(lang)) return !!Prism.languages[lang];
	const key = `/node_modules/prismjs/components/prism-${lang}.js`;
	const loader = LANG_MODULES[key];
	if (!loader) return false;
	await loader();
	loadedLangs.add(lang);
	return !!Prism.languages[lang];
}

const COPY_LABEL = "复制代码";
const COPIED_LABEL = "已复制代码";

@Component({
	selector: "app-code-block",
	imports: [MatIconModule],
	template: `<pre><code [class]="languageClass()" [innerHTML]="highlighted()"></code><button
  type="button"
  class="copy-btn"
  [class.copied]="copied()"
  [attr.aria-label]="copied() ? copiedLabel : copyLabel"
  (click)="copy()"
><mat-icon>{{ copied() ? "check" : "content_copy" }}</mat-icon></button></pre>`,
})
export class CodeBlockComponent {
	readonly code = input.required<string>();
	readonly language = input("");
	readonly copied = signal(false);
	readonly copyLabel = COPY_LABEL;
	readonly copiedLabel = COPIED_LABEL;
	private readonly sanitizer = inject(DomSanitizer);
	private readonly langLoaded = signal(false);

	readonly languageClass = computed(() => {
		const language = this.language().trim();
		return language ? `language-${language}` : "";
	});

	constructor() {
		effect(async () => {
			const lang = this.language().trim();
			if (!lang) return;
			await ensureLang(lang);
			this.langLoaded.set(true);
		});
	}

	readonly highlighted = computed(() => {
		this.langLoaded();
		const lang = this.language().trim();
		const grammar = lang ? Prism.languages[lang] : undefined;
		if (!grammar) return this.code();
		return this.sanitizer.bypassSecurityTrustHtml(
			Prism.highlight(this.code(), grammar, lang),
		);
	});

	async copy() {
		await navigator.clipboard.writeText(this.code());
		this.copied.set(true);
		setTimeout(() => this.copied.set(false), 2000);
	}
}
