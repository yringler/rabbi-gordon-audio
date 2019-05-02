import { Injectable } from '@angular/core';
import { NetworkPermissionService } from './network-permission.service';
import { action } from "tns-core-modules/ui/dialogs";

let options = {
	cancel: "Cancel",
	always: "Always",
	never: "Never"
}

@Injectable({
	providedIn: 'root'
})
export class RequestNetworkPermissionService {

	constructor(private networkPermission: NetworkPermissionService) { }

	requestPermission() {
		action(
			"Download media using mobile data connection?",
			options.cancel,
			[options.always, options.never]
		).then(result => {
			switch (result) {
				case options.always: this.networkPermission.setPermission(true);
					break;
				case options.never: this.networkPermission.setPermission(false);
			}
		});
	}
}
