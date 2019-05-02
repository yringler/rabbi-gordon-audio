import { Injectable } from '@angular/core';
import { ReplaySubject, Observable, BehaviorSubject } from 'rxjs';
import { connectionType, getConnectionType, startMonitoring } from "tns-core-modules/connectivity";
import {hasKey, getBoolean, setBoolean} from "tns-core-modules/application-settings";

/**
 * @description Id of settings which controls wether the app will download media over mobile data.
 */
const dataSettingId = "has-data-perm";

/**
 * @description The reason for why can/can't download.
 */
export enum PermissionReason {
	/**
	 * @description Download is possible because of network capabilities, or not possible because of
	 * network limitations, irrespective of users preferences.
	 */
	network,
	/** @description The current permission to download is dependent on the users preferences. */
	user,
	/** @description On a mobile connection, and we have no idea what the user wants. */
	unknown
}

export class NetworkPermission {
	canDownload: boolean;
	reason: PermissionReason;
}

@Injectable({
	providedIn: 'root'
})
export class NetworkPermissionService {
	private networkPermission$: BehaviorSubject<NetworkPermission>;

	/**
	 * @description Emits whenever permission is requested to download over mobile data.
	 */
	private permissionRequested$: ReplaySubject<null> = new ReplaySubject();

	constructor() {
		this.networkPermission$ = new BehaviorSubject(NetworkPermissionService.getPermission());

		startMonitoring(connection => {
			this.networkPermission$.next(NetworkPermissionService.getPermission(connection));
		});
	}

	/**
	 * @description Announce that you want to download over data.
	 */
	requestPermission() {
		this.permissionRequested$.next();
	}

	/**
	 * @description Get wether can download.
	 */
	getPermission(): Observable<NetworkPermission> {
		return this.networkPermission$;
	}

	setPermission(canUseData: boolean) {
		setBoolean(dataSettingId, canUseData);

		this.networkPermission$.next(NetworkPermissionService.getPermission());
	}

	/**
	 * Returns wether the app is able to download over the given connection type.
	 */
	private static getPermission(connection?: connectionType): NetworkPermission {
		if (connection == null) {
			connection = getConnectionType();
		}

		let permission = new NetworkPermission;

		// Set wether can download.
		if (connection == connectionType.mobile) {
			permission.canDownload = hasKey(dataSettingId) ? getBoolean(dataSettingId) : false;
		} else {
			permission.canDownload = connection == connectionType.wifi;
		}

		// Set the download permission reason.
		if (connection == connectionType.mobile) {
			permission.reason = hasKey(dataSettingId) ? PermissionReason.user : PermissionReason.unknown;
		} else {
			permission.reason = PermissionReason.network;
		}

		return permission;
	}
}
