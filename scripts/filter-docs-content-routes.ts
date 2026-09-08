export function removeDocsContentRoutes(code: string): string {
	// Keep repository docs on the custom renderer across Vite import rewrites.
	return code.replace(
		/"[^"]*\/src\/content\/docs\/[^"]+\.md":\s*\(\)\s*=>\s*import\((['"])[^'"]+\1\)\.then\(\s*\(?\s*m\s*\)?\s*=>\s*m\.default\s*\),?/g,
		"",
	);
}
