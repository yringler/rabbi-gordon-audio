import { Component, OnInit } from "@angular/core";
import { PurgeFileService } from "./shared/services/purge-file.service";
import { NetworkPermissionService } from "./shared/services/network-permission.service";
import { RequestNetworkPermissionService } from "./shared/services/request-network-permission.service";

@Component({
    moduleId: module.id,
    selector: "ns-app",
    templateUrl: "app.component.html"
})
export class AppComponent implements OnInit {

	constructor(
		private mediaPurger: PurgeFileService,
		private networkPermission: NetworkPermissionService,
		private requestPermission: RequestNetworkPermissionService
		) {}

	ngOnInit() {
		this.mediaPurger.purge().subscribe(deletedFiles => {
			console.log(`The following files were deleted: ${JSON.stringify(deletedFiles)}`);
		});

		// If our app ever wants to download something but can't because we don't know if user
		// allows mobile data downloads, ask.
		this.networkPermission.getPermissionRequestCheck().subscribe(
			() => this.requestPermission.requestPermission()
		)
	}
}
