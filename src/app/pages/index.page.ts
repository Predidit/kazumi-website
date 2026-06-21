import { Component } from "@angular/core";
import { ContributorsComponent } from "../features/home/contributors";
import { HeroComponent } from "../features/home/hero";
import { FooterComponent } from "../features/layout/footer";

@Component({
	selector: "app-home",
	imports: [HeroComponent, ContributorsComponent, FooterComponent],
	template: `
    <app-hero />
    <app-contributors />
    <app-footer />
  `,
})
export default class Home {}
