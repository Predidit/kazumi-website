import { describe, expect, it } from "vitest";
import iosGuide from "../../../content/docs/misc/how-to-install-in-ios.md?raw";
import { renderDoc } from "./doc-renderer";

describe("document rendering", () => {
	it.each([
		"NOTE",
		"TIP",
		"IMPORTANT",
		"WARNING",
		"CAUTION",
	])("preserves %s content starting with inline Markdown", async (type) => {
		const doc = await renderDoc(
			`> [!${type}]\n> **Bold text** followed by instructions.\n\n> [!${type}]\n> \`Start\` followed by instructions.\n\n> [!${type}]\n> [Guide](/docs) followed by instructions.`,
		);
		const container = document.createElement("div");
		container.innerHTML = doc.html;
		const alerts = container.querySelectorAll('div[style*="border-left"]');
		expect(alerts).toHaveLength(3);
		expect(alerts[0].querySelector("strong")?.textContent).toBe("Bold text");
		expect(alerts[1].querySelector("code")?.textContent).toBe("Start");
		expect(alerts[2].querySelector("a")?.getAttribute("href")).toBe("/docs");
		for (const alert of alerts) {
			expect(alert.textContent).toContain("followed by instructions.");
		}
	});

	it("renders both iOS installation tips, including the one inside a numbered step", async () => {
		const doc = await renderDoc(iosGuide);
		const container = document.createElement("div");
		container.innerHTML = doc.html;
		const tips = Array.from(
			container.querySelectorAll('div[style*="border-left"]'),
		).filter((alert) => alert.firstElementChild?.textContent === "TIP");
		expect(tips).toHaveLength(2);
		expect(tips[0].textContent).toContain("Windows 用户提示");
		expect(tips[0].querySelector("code")?.textContent).toBe("Win");
		expect(tips[1].textContent).toContain("每 7 天自动续签");
		expect(tips[1].querySelector("code")?.textContent).toBe("Start");
		expect(tips[1].closest("li")).not.toBeNull();
	});

	it("keeps heading IDs and TOCs isolated across concurrent documents", async () => {
		const documents = await Promise.all([
			renderDoc("# First\n\n## Shared\n\n## Shared"),
			renderDoc("# Second\n\n## Shared\n\n```dart\nprint('hello');\n```"),
			renderDoc("# Third\n\n## Shared"),
		]);
		expect(documents.map((doc) => doc.toc.map((item) => item.id))).toEqual([
			["first", "shared", "shared-1"],
			["second", "shared"],
			["third", "shared"],
		]);
		for (const doc of documents) {
			for (const item of doc.toc) expect(doc.html).toContain(`id="${item.id}"`);
		}
	});

	it("escapes unsupported code languages and retains copy buttons for both code paths", async () => {
		const doc = await renderDoc(
			"```dart\nprint('hello');\n```\n\n```unknown\n<script>alert('test')</script>\n```",
		);
		const container = document.createElement("div");
		container.innerHTML = doc.html;
		expect(container.querySelectorAll("pre .copy-btn")).toHaveLength(2);
		expect(container.querySelectorAll("pre code")[1].textContent).toBe(
			"<script>alert('test')</script>",
		);
		expect(container.querySelector("script")).toBeNull();
		expect(container.querySelector("pre.shiki span[style]")).not.toBeNull();
	});

	it("places escaped author metadata after the title and preserves alerts", async () => {
		const doc = await renderDoc(
			"---\ntitle: Guide\nauthors: [' Alice ' , '<Bob>', ' ']\n---\n# Guide\n\n> [!NOTE]\n> Read this first.",
		);
		const container = document.createElement("div");
		container.innerHTML = doc.html;
		expect(doc.attributes.title).toBe("Guide");
		expect(container.querySelector("h1")?.nextElementSibling?.className).toBe(
			"doc-authors",
		);
		expect(container.querySelectorAll(".doc-author")).toHaveLength(2);
		expect(
			container.querySelectorAll(".doc-author")[1].getAttribute("title"),
		).toBe("<Bob>");
		expect(
			container.querySelectorAll(".doc-author")[1].getAttribute("href"),
		).toBe("https://github.com/%3CBob%3E");
		expect(container.textContent).toContain("Read this first.");
	});
});
