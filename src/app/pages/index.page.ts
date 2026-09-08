import { Component, inject } from "@angular/core";
import { HeroComponent } from "../features/home/hero";
import { SeoService } from "../features/seo/seo.service";

@Component({
	selector: "app-home",
	imports: [HeroComponent],
	template: `<app-hero />`,
})
export default class Home {
	constructor() {
		inject(SeoService).setHome();
	}
}
