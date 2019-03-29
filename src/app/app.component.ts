import { Component, OnInit } from "@angular/core";
import { Downloader } from 'nativescript-downloader';
import { PurgeFileService } from "./shared/services/purge-file.service";

@Component({
    moduleId: module.id,
    selector: "ns-app",
    templateUrl: "app.component.html"
})
export class AppComponent implements OnInit {

	constructor(private mediaPurger: PurgeFileService) {}

	ngOnInit() {
		Downloader.init();
		
		this.mediaPurger.purge().subscribe(deletedFiles => {
			console.log(`The following files were deleted: ${JSON.stringify(deletedFiles)}`);
		});
	}
}
