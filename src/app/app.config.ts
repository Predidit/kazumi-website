import { provideFileRouter } from "@analogjs/router";
import {
	ApplicationConfig,
	provideBrowserGlobalErrorListeners,
} from "@angular/core";
import {
	provideClientHydration,
	withNoIncrementalHydration,
} from "@angular/platform-browser";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { withInMemoryScrolling } from "@angular/router";

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideFileRouter(
			withInMemoryScrolling({
				scrollPositionRestoration: "enabled",
				anchorScrolling: "enabled",
			}),
		),
		provideClientHydration(withNoIncrementalHydration()),
		provideAnimationsAsync(),
	],
};
