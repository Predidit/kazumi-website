import { Component, computed, input, signal } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";

const COPY_LABEL = "复制代码";
const COPIED_LABEL = "已复制代码";

@Component({
	selector: "app-code-block",
	imports: [MatIconModule],
	template: `
    <pre>
      <code [class]="languageClass()">{{ code() }}</code>
      <button
        type="button"
        class="copy-btn"
        [class.copied]="copied()"
        [attr.aria-label]="copied() ? copiedLabel : copyLabel"
        (click)="copy()"
      >
        <mat-icon>{{ copied() ? "check" : "content_copy" }}</mat-icon>
      </button>
    </pre>
  `,
})
export class CodeBlockComponent {
	readonly code = input.required<string>();
	readonly language = input("");
	readonly copied = signal(false);
	readonly copyLabel = COPY_LABEL;
	readonly copiedLabel = COPIED_LABEL;

	readonly languageClass = computed(() => {
		const language = this.language().trim();
		return language ? `language-${language}` : "";
	});

	async copy() {
		await navigator.clipboard.writeText(this.code());
		this.copied.set(true);
		setTimeout(() => this.copied.set(false), 2000);
	}
}
