import fm from "front-matter";
import { Marked, type Token } from "marked";
import { gfmAlert } from "marked-gfm-alert";
import { getHeadingList, gfmHeadingId } from "marked-gfm-heading-id";
import { createHighlighterCore } from "shiki/core";
import bash from "shiki/dist/langs/bash.mjs";
import dart from "shiki/dist/langs/dart.mjs";
import githubDark from "shiki/dist/themes/github-dark.mjs";
import githubLight from "shiki/dist/themes/github-light.mjs";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

interface DocAttributes {
	title?: string;
	description?: string;
	section?: string;
	authors?: string[];
}

const highlighterReady = createHighlighterCore({
	themes: [githubLight, githubDark],
	langs: [bash, dart],
	engine: createJavaScriptRegexEngine(),
}).catch((error) => {
	console.warn("Shiki initialization failed; using plain code blocks", error);
	return null;
});

const COPY_BUTTON =
	'<button type="button" class="copy-btn" aria-label="复制代码"><span class="mdi mdi-content-copy" aria-hidden="true"></span></button>';

export async function renderDoc(raw: string) {
	const { body, attributes } = fm<DocAttributes>(raw);
	const highlighter = await highlighterReady;
	const markdown = new Marked(
		gfmHeadingId(),
		gfmAlert({ inlineStyles: true }),
		{
			walkTokens: preserveAlertBody,
			renderer: {
				code({ text, lang }) {
					const language = lang?.split(/\s+/, 1)[0] ?? "";
					const html = highlighter?.getLoadedLanguages().includes(language)
						? highlighter.codeToHtml(text, {
								lang: language,
								themes: { light: "github-light", dark: "github-dark" },
							})
						: `<pre class="shiki"><code>${escapeHtml(text)}</code></pre>`;
					return html.replace(/(<pre\b[^>]*>)/, `$1${COPY_BUTTON}`);
				},
			},
		},
	);
	// Heading IDs use module state; keep parsing and TOC capture synchronous.
	const html = markdown.parse(body, { async: false });
	const toc = getHeadingList().map(({ id, level, raw }) => ({
		id,
		level,
		text: raw,
	}));
	return { attributes, html: insertAuthors(html, attributes.authors), toc };
}

function preserveAlertBody(token: Token): void {
	if (token.type !== "blockquote" || !token.tokens) return;
	const paragraph = token.tokens[0];
	if (paragraph?.type !== "paragraph" || !paragraph.tokens) return;
	const [marker, ...body] = paragraph.tokens;
	if (
		marker?.type !== "text" ||
		!/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/i.test(marker.text) ||
		!body.length
	)
		return;

	// The alert plugin drops the whole paragraph when its first text token is only a marker.
	token.tokens.splice(
		0,
		1,
		{ ...paragraph, raw: marker.raw, text: marker.text, tokens: [marker] },
		{
			...paragraph,
			raw: paragraph.raw.slice(marker.raw.length),
			text: paragraph.text.slice(marker.raw.length),
			tokens: body,
		},
	);
}

function insertAuthors(html: string, authors?: string[]): string {
	const normalized = authors?.map((author) => author.trim()).filter(Boolean);
	if (!normalized?.length) return html;
	const links = normalized
		.map((author) => {
			const safeAuthor = escapeHtml(author);
			const encodedAuthor = encodeURIComponent(author);
			return `<a class="doc-author" href="https://github.com/${encodedAuthor}" target="_blank" rel="noopener noreferrer" title="${safeAuthor}"><img src="https://github.com/${encodedAuthor}.png?size=40" alt="${safeAuthor}" loading="lazy" width="40" height="40" /></a>`;
		})
		.join("");
	const block = `<div class="doc-authors" aria-label="文档作者"><span>作者</span><div class="doc-author-list">${links}</div></div>`;
	const titleEnd = html.indexOf("</h1>");
	const insertAt = titleEnd === -1 ? 0 : titleEnd + "</h1>".length;
	return `${html.slice(0, insertAt)}${block}${html.slice(insertAt)}`;
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}
