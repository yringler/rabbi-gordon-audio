import { Component, OnInit } from "@angular/core";
import { Downloader } from 'nativescript-downloader';

@Component({
    moduleId: module.id,
    selector: "ns-app",
    templateUrl: "app.component.html"
})
export class AppComponent implements OnInit {
	ngOnInit() {
		Downloader.init();
	}
}
