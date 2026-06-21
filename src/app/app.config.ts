import { provideContent, withMarkdownRenderer } from "@analogjs/content";
import { provideFileRouter, requestContextInterceptor } from "@analogjs/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import {
	ApplicationConfig,
	provideBrowserGlobalErrorListeners,
} from "@angular/core";
import {
	provideClientHydration,
	withNoIncrementalHydration,
} from "@angular/platform-browser";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideFileRouter(),
		provideHttpClient(withInterceptors([requestContextInterceptor])),
		provideClientHydration(withNoIncrementalHydration()),
		provideAnimationsAsync(),
		provideContent(withMarkdownRenderer()),
	],
};
