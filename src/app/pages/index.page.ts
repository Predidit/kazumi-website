import { Component } from "@angular/core";
import { FooterComponent } from "../components/footer";
import { ContributorsComponent } from "./home/contributors";
import { HeroComponent } from "./home/hero";

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
