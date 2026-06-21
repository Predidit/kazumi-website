import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
	selector: "app-about",
	imports: [RouterOutlet],
	template: `<router-outlet />`,
})
export default class AboutLayout {}
