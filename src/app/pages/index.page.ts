import { Component } from "@angular/core";
import { FooterComponent } from "../components/footer";
import { ContributorsComponent } from "./home/contributors";
import { FeaturesComponent } from "./home/features";
import { HeroComponent } from "./home/hero";

@Component({
	selector: "app-home",
	imports: [
		HeroComponent,
		FeaturesComponent,
		ContributorsComponent,
		FooterComponent,
	],
	template: `
    <app-hero />
    <app-features />
    <app-contributors />
    <app-footer />
  `,
})
export default class Home {}
